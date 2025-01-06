import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import { CrawlTooRecentError } from "../lib/error";

import BaseQueue, { IJobProcessor, ISuccessCallback } from "./BaseQueue";

import MBinCrawler from "../crawl/mbin";

export default class MBinQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "kbin") {
    const processor: IJobProcessor = async ({ baseUrl }) => {
      const startTime = Date.now();

      try {
        // check for recent scan of this KBIN instance
        const lastCrawl = await storage.tracking.getLastCrawl("mbin", baseUrl);
        if (lastCrawl) {
          const lastCrawledMsAgo = Date.now() - lastCrawl.time;
          throw new CrawlTooRecentError(`Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`);
        }

        const crawler = new MBinCrawler();
        const mbinInstance = await crawler.processOneInstance(baseUrl);

        await storage.tracking.setLastCrawl("mbin", baseUrl, {
          duration: (Date.now() - startTime) / 1000,
        });

        return mbinInstance;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(`[MBinQueue] [${baseUrl}] CrawlTooRecentError: ${error.message}`);
          return true;
        }

        const errorDetail = {
          error: error.message,
          // stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: Date.now(),
        };

        await storage.tracking.upsertError("mbin", baseUrl, errorDetail);

        logging.error(`[MBinQueue] [${baseUrl}] Error: ${error.message}`, error);
      }

      return false;
    };

    super(isWorker, queueName, processor);
  }

  // use as KBinQueue.createJob({ baseUrl: "https://kbin.io" });
  async createJob(baseUrl: string, onSuccess: ISuccessCallback = null) {
    await super.createJob(baseUrl, { baseUrl }, onSuccess);
  }
}
