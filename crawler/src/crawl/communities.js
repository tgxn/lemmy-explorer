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

export default class CrawlCommunity {
  constructor(isWorker = false) {
    this.queue = new Queue("community", {
      removeOnSuccess: true,
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
    const job = this.queue.createJob({ baseUrl: instanceBaseUrl });
    job.timeout(CRAWL_TIMEOUT.COMMUNITY).retries(CRAWL_RETRY.COMMUNITY).save();
    // job.on("succeeded", (result) => {
    //   console.log(`Completed communityQueue ${job.id}`, instanceBaseUrl);
    //   console.log();
    // });
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        // if it's not a string
        if (typeof job.data.baseUrl !== "string") {
          console.error("baseUrl is not a string", job.data);
          throw new Error("baseUrl is not a string");
        }
        // console.debug(
        //   `[Community] [${job.data.baseUrl}] [${job.id}] Starting Crawl`
        // );

        let instanceBaseUrl = job.data.baseUrl.toLowerCase();
        instanceBaseUrl = instanceBaseUrl.replace(/\s/g, ""); // remove spaces
        instanceBaseUrl = instanceBaseUrl.replace(/.*@/, ""); // remove anything before an @ if present

        const communityData = await this.crawlCommunity(instanceBaseUrl);

        // store each community
        for (var community of communityData) {
          await putCommunityData(instanceBaseUrl, {
            ...community,
            lastCrawled: new Date().getTime(),
          });
        }

        console.log(
          `[Community] [${job.data.baseUrl}] [${job.id}] Completed OK (Found ${communityData.length} Local Communities)`
        );
        return communityData;
      } catch (e) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          response: error.isAxiosError ? error.response : null,
          time: new Date().getTime(),
        };
        await storeError("community", job.data.baseUrl, errorDetail);
        console.error(
          `[Community] [${job.data.baseUrl}] [${job.id}] ${error.message}`
        );
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
