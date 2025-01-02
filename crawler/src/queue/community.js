import BaseQueue from "./queue.js";

import CommunityCrawler from "../crawl/community.js";

import logging from "../lib/logging.js";
import storage from "../storage.js";

import { CrawlTooRecentError } from "../lib/error.js";

export default class CommunityQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "community") {
    const processor = async ({ baseUrl }) => {
      const startTime = Date.now();

      try {
        // check if community's instance has already been crawled revcently (these expire from redis)
        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "community",
          baseUrl
        );
        if (lastCrawlTs) {
          const lastCrawledMsAgo = Date.now() - lastCrawlTs;
          throw new CrawlTooRecentError(
            `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
          );
        }

        // check when the latest entry to errors was too recent
        const lastErrorTs = await storage.tracking.getOneError(
          "community",
          baseUrl
        );
        if (lastErrorTs) {
          const lastErrorMsAgo = Date.now() - lastErrorTs.time;
          throw new CrawlTooRecentError(
            `Skipping - Error too recently (${lastErrorMsAgo / 1000}s ago)`
          );
        }

        // perform the crawl
        const crawler = new CommunityCrawler(baseUrl);
        const communityData = await crawler.crawlList();

        // set last successful crawl
        await storage.tracking.setLastCrawl("community", baseUrl, {
          duration: (Date.now() - startTime) / 1000,
          resultCount: communityData.length,
        });

        const endTime = Date.now();
        logging.info(
          `[Community] [${baseUrl}] Finished in ${
            (endTime - startTime) / 1000
          }s`
        );

        return communityData;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[Community] [${baseUrl}] CrawlTooRecentError: ${error.message}`
          );
        } else {
          const errorDetail = {
            error: error.message,
            stack: error.stack,
            isAxiosError: error.isAxiosError,
            requestUrl: error.isAxiosError ? error.request.url : null,
            time: Date.now(),
            duration: Date.now() - startTime,
          };

          logging.error(`[Community] [${baseUrl}] Error: ${error.message}`);

          // if (error instanceof CrawlError || error instanceof AxiosError) {
          await storage.tracking.upsertError("community", baseUrl, errorDetail);
        }
      }

      return null;
    };

    super(isWorker, queueName, processor);
  }

  async createJob(instanceBaseUrl, onSuccess = null) {
    const trimmedUrl = instanceBaseUrl.trim();

    return await super.createJob(
      trimmedUrl,
      {
        baseUrl: trimmedUrl,
      },
      onSuccess
    );
  }
}
