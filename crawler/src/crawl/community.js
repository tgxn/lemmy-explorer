import logging from "../lib/logging.js";

import axios from "axios";

import { putCommunityData } from "../lib/storage.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";

// import storage from "../storage/storage.js";

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
    let communities = 0;
    if (communityData.length > 0) {
      for (var community of communityData) {
        // validate the communbity actor id matches the domain
        // logging.info("some community", community.community.actor_id);

        // the actor id for the community should match the domain https://lemmy.fmhy.ml/c/freemediaheckyeah
        const splitActorId = community.community.actor_id.split("/");
        const urlPart = splitActorId[2];
        const communityPart = splitActorId[4];

        // logging.info("urlPart", urlPart, communityPart);

        if (urlPart != this.crawlDomain) {
          logging.error(
            `[Community] [${this.crawlDomain}] Community actor_id does not match domain: ${community.community.actor_id}`
          );
          continue;
        }

        await putCommunityData(this.crawlDomain, {
          ...community,
          lastCrawled: Date.now(),
        });
        communities++;
      }
    }

    logging.info(
      `[Community] [${this.crawlDomain}] Completed OK (Stored ${communities}/${communityData.length} Local Communities)`
    );
    return communityData;
  }

  async crawlCommunityPaginatedList(pageNumber = 1) {
    logging.debug(`page number ${pageNumber}`);
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
    try {
      const communities = communityList.data.communities;

      let list = [];

      list.push(...communities);

      if (communities.length == 50) {
        const pagenew = await this.crawlCommunityPaginatedList(pageNumber + 1);

        list.push(...pagenew);
      }

      return list;
    } catch (e) {
      throw new CrawlError("Community list not found in api response");
    }
  }
}
