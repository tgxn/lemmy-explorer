import logging from "../lib/logging";

import storage from "../storage";

import { CrawlTooRecentError } from "../lib/error";

import CommunityCrawler from "../crawl/community";

import BaseQueue from "./queue";

export default class SingleCommunityQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "one_community") {
    const processor = async ({ baseUrl, community }) => {
      await storage.connect();

      let communityData = null;
      try {
        const crawler = new CommunityCrawler(baseUrl);

        communityData = await crawler.crawlSingle(community);
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[OneCommunity] [${baseUrl}] CrawlTooRecentError: ${error.message}`
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
          await storage.tracking.upsertError(
            "one_community",
            baseUrl,
            errorDetail
          );

          logging.error(`[OneCommunity] [${baseUrl}] Error: ${error.message}`);
        }
      }

      // close redis connection on end of job
      await storage.close();

      return communityData;
    };

    super(isWorker, queueName, processor);
  }

  async createJob(baseUrl, communityName, onSuccess = null) {
    const trimmedUrl = baseUrl.trim();

    return await super.createJob(
      trimmedUrl,
      {
        baseUrl: trimmedUrl,
        community: communityName,
      },
      onSuccess
    );
  }
}
