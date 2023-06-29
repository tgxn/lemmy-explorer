import logging from "../lib/logging.js";

import { CrawlError } from "../lib/error.js";

import storage from "../storage.js";

import AxiosClient from "../lib/axios.js";

export default class CommunityCrawler {
  constructor(crawlDomain) {
    this.crawlDomain = crawlDomain;

    this.client = new AxiosClient();
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

        await storage.community.setTrackedAttribute(
          this.crawlDomain,
          communityPart,
          "subscribers",
          community.counts.subscribers
        );

        await storage.community.upsert(this.crawlDomain, community);
        communities++;
      }
    }

    logging.info(
      `[Community] [${this.crawlDomain}] Completed OK (Stored ${communities}/${communityData.length} Local Communities)`
    );
    return communityData;
  }

  async crawlCommunityPaginatedList(pageNumber = 1) {
    logging.silly(`page number ${pageNumber}`);

    let communityList;
    try {
      communityList = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community/list",
        {
          params: {
            type_: "Local",
            page: pageNumber,
            limit: 50,
            show_nsfw: true, // Added in 0.18.x? ish...
          },
        }
      );
    } catch (e) {
      throw new CrawlError("Failed to get community page");
    }

    const communities = communityList.data.communities;

    //must be an array
    if (!Array.isArray(communities)) {
      throw new CrawlError(`Community list not an array: ${communities}`);
    }

    let list = [];

    list.push(...communities);

    if (communities.length == 50) {
      // sleep for 1s between pages
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pagenew = await this.crawlCommunityPaginatedList(pageNumber + 1);

      list.push(...pagenew);
    }

    return list;
  }
}
