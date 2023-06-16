import logging from "../lib/logging.js";

import axios from "axios";

import { putCommunityData } from "../lib/storage.js";

import {
  AXIOS_REQUEST_TIMEOUT,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
} from "../lib/const.js";

export default class CommunityCrawler {
  constructor(crawlDomain) {
    this.crawlDomain = crawlDomain;

    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });
  }

  async crawl() {
    logging.debug(`[Community] [${this.crawlDomain}] Starting Crawl`);

    const communityData = await this.crawlCommunityPaginatedList();

    // store each community
    if (communityData.length > 0) {
      for (var community of communityData) {
        await putCommunityData(this.crawlDomain, {
          ...community,
          lastCrawled: Date.now(),
        });
      }
    }

    logging.info(
      `[Community] [${this.crawlDomain}] Completed OK (Stored ${communityData.length} Local Communities)`
    );
    return communityData;
  }

  async crawlCommunityPaginatedList(pageNumber = 1) {
    const communityList = await this.axios.get(
      "https://" + this.crawlDomain + "/api/v3/community/list",
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
      const pagenew = await this.crawlCommunityPaginatedList(pageNumber + 1);

      list.push(...pagenew);
    }

    return list;
  }
}
