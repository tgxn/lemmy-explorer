import logging from "../lib/logging.js";

import Queue from "bee-queue";
import axios from "axios";

import { putCommunityData, storeError } from "../lib/storage.js";

import {
  CRAWL_TIMEOUT,
  CRAWL_RETRY,
  AXIOS_REQUEST_TIMEOUT,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
} from "../lib/const.js";

import { CrawlError } from "../lib/error.js";

import CommunityCrawler from "../crawl/community.js";

export default class CommunityQueue {
  constructor(isWorker = false, queueName = "community") {
    this.queue = new Queue(queueName, {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });

    if (isWorker) this.process();
  }

  async createJob(instanceBaseUrl, onSuccess = null) {
    const trimmedUrl = instanceBaseUrl.trim();
    const job = this.queue.createJob({ baseUrl: trimmedUrl });

    logging.silly("CommunityQueue createJob", trimmedUrl);
    await job
      .timeout(CRAWL_TIMEOUT.COMMUNITY)
      .retries(CRAWL_RETRY.COMMUNITY)
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
        const crawler = new CommunityCrawler(job.data.baseUrl);
        const communityData = await crawler.crawl();

        return communityData;
      } catch (e) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          response: error.isAxiosError ? error.response : null,
          time: Date.now(),
        };
        await storeError("community", job.data.baseUrl, errorDetail);
        logging.error(`[Community] [${job.data.baseUrl}] ${error.message}`);
        if (typeof error === Error) logging.verbose(error);
      }
      return false;
    });
  }
}
