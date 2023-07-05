import logging from "../lib/logging.js";

import Queue from "bee-queue";

import storage from "../storage.js";

import { CrawlTooRecentError } from "../lib/error.js";
import { CRAWL_TIMEOUT, MIN_RECRAWL_MS } from "../lib/const.js";

import CommunityCrawler from "../crawl/community.js";

import BaseQueue from "./queue.js";

export default class CommunityQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "community") {
    const processor = async ({ baseUrl }) => {
      await storage.connect();

      let communityData = null;
      try {
        // check if community's instance has already been crawled within MIN_RECRAWL_MS
        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "community",
          baseUrl
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
          baseUrl
        );
        if (lastErrorTs) {
          const lastErrorMsAgo = Date.now() - lastErrorTs;
          if (lastErrorMsAgo < MIN_RECRAWL_MS) {
            throw new CrawlTooRecentError(
              `Skipping - Error too recently (${lastErrorMsAgo / 1000}s ago)`
            );
          }
        }

        const crawler = new CommunityCrawler(baseUrl);
        const communityData = await crawler.crawlList();

        // set last successful crawl
        await storage.tracking.setLastCrawl("community", baseUrl);
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
          };

          // if (error instanceof CrawlError || error instanceof AxiosError) {
          await storage.tracking.upsertError("community", baseUrl, errorDetail);

          logging.error(`[Community] [${baseUrl}] Error: ${error.message}`);
        }
      }

      // close redis connection on end of job
      await storage.close();
      return communityData;
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
