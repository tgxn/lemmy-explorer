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
  constructor(isWorker = false) {
    this.queue = new Queue("community", {
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

  createJob(instanceBaseUrl) {
    const trimmedUrl = instanceBaseUrl.trim();
    const job = this.queue.createJob({ baseUrl: trimmedUrl });
    job
      .timeout(CRAWL_TIMEOUT.COMMUNITY)
      .retries(CRAWL_RETRY.COMMUNITY)
      .setId(trimmedUrl) // deduplicate
      .save();
    // job.on("succeeded", (result) => {
    //   logging.info(`Completed communityQueue ${job.id}`, instanceBaseUrl);
    // });
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        const crawler = new CommunityCrawler(job.data.baseUrl);
        const communityData = await crawler.crawl();

        // store each community
        for (var community of communityData) {
          await putCommunityData(instanceBaseUrl, {
            ...community,
            lastCrawled: Date.now(),
          });
        }

        logging.info(
          `[Community] [${job.data.baseUrl}] [${job.id}] Completed OK (Found ${communityData.length} Local Communities)`
        );
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
        logging.error(
          `[Community] [${job.data.baseUrl}] [${job.id}] ${error.message}`
        );
        if (typeof error === Error) logging.trace(error);
      }
      return false;
    });
  }

  async crawlCommunity(instanceBaseUrl) {
    const communityList = await this.crawlCommunityPaginatedList(
      instanceBaseUrl
    );

    return communityList;
  }

  async crawlCommunityPaginatedList(instanceBaseUrl, pageNumber = 1) {
    const communityList = await this.axios.get(
      "https://" + instanceBaseUrl + "/api/v3/community/list",
      {
        params: {
          type_: "Local",
          page: pageNumber,
          limit: 50,
        },
      }
    );
    const communities = communityList.data.communities;

    let list = [];

    list.push(...communities);

    if (communities.length == 50) {
      const pagenew = await this.crawlCommunityPaginatedList(
        instanceBaseUrl,
        pageNumber + 1
      );

      list.push(...pagenew);
    }

    return list;
  }
}
