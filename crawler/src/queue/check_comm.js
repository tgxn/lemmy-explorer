import logging from "../lib/logging.js";

import Queue from "bee-queue";

import storage from "../storage.js";

import { CrawlError, CrawlTooRecentError } from "../lib/error.js";
import { CRAWL_TIMEOUT, MIN_RECRAWL_MS } from "../lib/const.js";

import SingleCommunityCrawler from "../crawl/checkonecomm.js";

export default class SingleCommunityQueue {
  constructor(isWorker = false, queueName = "one_community") {
    this.queue = new Queue(queueName, {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(
        `SingleCommunityQueue Job ${job.id} failed with error ${err.message}`,
        job,
        err
      );
    });

    if (isWorker) this.process();
  }

  async createJob(baseUrl, communityName, onSuccess = null) {
    const trimmedUrl = baseUrl.trim();
    const job = this.queue.createJob({
      baseUrl: trimmedUrl,
      community: communityName,
    });

    logging.silly("one_CommunityQueue createJob", trimmedUrl);
    await job
      .timeout(CRAWL_TIMEOUT.COMMUNITY)
      .setId(`${trimmedUrl}-${communityName}`) // deduplicate
      .save();
    job.on("succeeded", (result) => {
      // logging.info(`Completed communityQueue ${job.id}`, instanceBaseUrl);
      onSuccess && onSuccess(result);
    });
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        const baseUrl = job.data.baseUrl;
        const communityName = job.data.community;

        const crawler = new SingleCommunityCrawler(baseUrl, communityName);
        const communityData = await crawler.crawl();

        return communityData;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[OneCommunity] [${job.data.baseUrl}] CrawlTooRecentError: ${error.message}`
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
          "one_community",
          job.data.baseUrl,
          errorDetail
        );

        logging.error(
          `[OneCommunity] [${job.data.baseUrl}] Error: ${error.message}`
        );
        //   }

        //   // warning causes the job to leave the queue and no error to be created (it will be retried next time we add the job)
        //   else if (error instanceof CrawlTooRecentError) {
        //     logging.warn(
        //       `[Community] [${job.data.baseUrl}] Warn: ${error.message}`
        //     );
        //   } else {
        //     logging.verbose(
        //       `[Community] [${job.data.baseUrl}] Error: ${error.message}`
        //     );
        //   }
        // } finally {
        //   // set last scan time if it was success or failure.
        //   await storage.tracking.setLastCrawl("community", job.data.baseUrl);
      }
      return false;
    });
  }
}
