import logging from "../lib/logging.js";

import Queue from "bee-queue";

import storage from "../storage.js";

import { CrawlTooRecentError } from "../lib/error.js";
import { CRAWL_TIMEOUT, MIN_RECRAWL_MS } from "../lib/const.js";

import CommunityCrawler from "../crawl/community.js";

export default class CommunityQueue {
  constructor(isWorker = false, queueName = "community") {
    this.queue = new Queue(queueName, {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(
        `CommunityQueue Job ${job.id} failed with error ${err.message}`,
        job,
        err
      );
    });

    if (isWorker) this.process();
  }

  async createJob(instanceBaseUrl, onSuccess = null) {
    const trimmedUrl = instanceBaseUrl.trim();
    const job = this.queue.createJob({ baseUrl: trimmedUrl });

    logging.silly("CommunityQueue createJob", trimmedUrl);
    await job
      .timeout(CRAWL_TIMEOUT.COMMUNITY)
      .setId(trimmedUrl) // deduplicate
      .save();
    job.on("succeeded", (result) => {
      // logging.info(`Completed communityQueue ${job.id}`, instanceBaseUrl);
      onSuccess && onSuccess(result);
    });
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        const instanceBaseUrl = job.data.baseUrl;

        // check if community's instance has already been crawled within MIN_RECRAWL_MS
        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "community",
          instanceBaseUrl
        );
        if (lastCrawlTs) {
          const lastCrawledMsAgo = Date.now() - lastCrawlTs;
          if (lastCrawledMsAgo < MIN_RECRAWL_MS) {
            throw new CrawlTooRecentError(
              `Skipping - Crawled too recently (${
                lastCrawledMsAgo / 1000
              }s ago)`
            );
          }
        }

        // check when the latest entry to errors was too recent
        const lastErrorTs = await storage.tracking.getOneError(
          "community",
          instanceBaseUrl
        );
        if (lastErrorTs) {
          const lastErrorMsAgo = Date.now() - lastErrorTs;
          if (lastErrorMsAgo < MIN_RECRAWL_MS) {
            throw new CrawlTooRecentError(
              `Skipping - Error too recently (${lastErrorMsAgo / 1000}s ago)`
            );
          }
        }

        const crawler = new CommunityCrawler(instanceBaseUrl);
        const communityData = await crawler.crawlList();

        // set last successful crawl
        await storage.tracking.setLastCrawl("community", job.data.baseUrl);

        return communityData;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[Community] [${job.data.baseUrl}] CrawlTooRecentError: ${error.message}`
          );
          return true;
        }

        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: Date.now(),
        };

        // if (error instanceof CrawlError || error instanceof AxiosError) {
        await storage.tracking.upsertError(
          "community",
          job.data.baseUrl,
          errorDetail
        );

        logging.error(
          `[Community] [${job.data.baseUrl}] Error: ${error.message}`
        );
      }
      return false;
    });
  }
}
