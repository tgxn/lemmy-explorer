import logging from "../lib/logging.js";

import Queue from "bee-queue";
import { AxiosError } from "axios";

import storage from "../storage.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";
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

  // // returns a amount os ms since we last crawled it, false if all good
  // async getLastCrawlMsAgo(instanceBaseUrl) {
  //   // // rely on the last crawled time in the instance table.
  //   // const existingInstance = await storage.instance.getOne(instanceBaseUrl);
  //   // if (existingInstance?.lastCrawled) {
  //   //   // logging.info("lastCrawled", existingInstance.lastCrawled);

  //   //   const lastCrawl = existingInstance.lastCrawled;
  //   //   const now = Date.now();

  //   //   return now - lastCrawl;
  //   // }

  //   // // check for recent error
  //   // const lastError = await storage.tracking.getOneError(
  //   //   "community",
  //   //   instanceBaseUrl
  //   // );
  //   // if (lastError?.time) {
  //   //   // logging.info("lastError", lastError.time);

  //   //   const lastErrorTime = lastError.time;
  //   //   const now = Date.now();

  //   //   return now - lastErrorTime;
  //   // }

  //   const lastCrawlTs = await storage.tracking.getLastCrawl("instance", instanceBaseUrl);

  //   return false;
  // }

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
            throw new CrawlWarning(
              `Skipping - Crawled too recently (${
                lastCrawledMsAgo / 1000
              }s ago)`
            );
          }
        }

        const crawler = new CommunityCrawler(instanceBaseUrl);
        const communityData = await crawler.crawl();

        return communityData;
      } catch (error) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: Date.now(),
        };

        if (error instanceof CrawlError || error instanceof AxiosError) {
          await storage.tracking.upsertError(
            "community",
            job.data.baseUrl,
            errorDetail
          );

          logging.error(
            `[Community] [${job.data.baseUrl}] Error: ${error.message}`
          );
        }

        // warning causes the job to leave the queue and no error to be created (it will be retried next time we add the job)
        else if (error instanceof CrawlWarning) {
          logging.warn(
            `[Community] [${job.data.baseUrl}] Warn: ${error.message}`
          );
        } else {
          logging.verbose(
            `[Community] [${job.data.baseUrl}] Error: ${error.message}`
          );
        }
      } finally {
        // set last scan time if it was success or failure.
        await storage.tracking.setLastCrawl("community", job.data.baseUrl);
      }
      return false;
    });
  }
}
