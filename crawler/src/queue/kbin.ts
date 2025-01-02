import logging from "../lib/logging";
import { CrawlTooRecentError } from "../lib/error";

import storage from "../storage";

import KBinCrawler from "../crawl/kbin";

import BaseQueue from "./queue";

export default class KBinQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "kbin") {
    const processor = async ({ baseUrl }) => {
      const startTime = Date.now();

      try {
        // check for recent scan of this KBIN instance
        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "kbin",
          baseUrl
        );
        if (lastCrawlTs) {
          const lastCrawledMsAgo = Date.now() - lastCrawlTs;
          throw new CrawlTooRecentError(
            `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
          );
        }

        const crawler = new KBinCrawler();
        const kbinInstance = await crawler.processOneInstance(baseUrl);

        await storage.tracking.setLastCrawl("kbin", baseUrl, {
          duration: (Date.now() - startTime) / 1000,
        });

        return kbinInstance;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[KBinQueue] [${baseUrl}] CrawlTooRecentError: ${error.message}`
          );
          return true;
        }

        const errorDetail = {
          error: error.message,
          // stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: Date.now(),
        };

        // if (error instanceof CrawlError || error instanceof AxiosError) {
        await storage.tracking.upsertError("kbin", baseUrl, errorDetail);

        logging.error(
          `[KBinQueue] [${baseUrl}] Error: ${error.message}`,
          error
        );
      }

      return false;
    };

    super(isWorker, queueName, processor);
  }

  // use as KBinQueue.createJob({ baseUrl: "https://kbin.io" });
  async createJob(baseUrl, onSuccess = null) {
    await super.createJob(baseUrl, { baseUrl }, onSuccess);
  }
}
