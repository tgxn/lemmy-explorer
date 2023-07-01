import logging from "../lib/logging.js";

import { open } from "node:fs/promises";

import { CrawlError } from "../lib/error.js";

import storage from "../storage.js";

import AxiosClient from "../lib/axios.js";

export default class SingleCommunityCrawler {
  constructor(crawlDomain, crawlCommunity) {
    this.crawlDomain = crawlDomain;
    this.crawlCommunity = crawlCommunity;

    this.client = new AxiosClient();
  }

  async crawl() {
    logging.debug(
      `[Finger] [${this.crawlDomain}/${this.crawlCommunity}] Starting Crawl`
    );

    let communityData;

    try {
      communityData = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community",
        {
          params: {
            name: this.crawlCommunity,
          },
        }
      );
      communityData = communityData.data;

      // logging.info("some community", communityData.community_view);

      if (communityData.community_view) {
        const community = communityData.community_view;
        const { removed, deleted, hidden } = community;

        if (community.community.name) {
          await storage.community.upsert(this.crawlDomain, community);
          console.log(
            `[Finger] [${this.crawlDomain}/${this.crawlCommunity}] UPSERT community`,
            community.community.name
          );
        }

        if (deleted || removed) {
          console.log("DELETED community", communityData.community_view);
          console.log(
            `[Finger] [${this.crawlDomain}/${this.crawlCommunity}] DELETED`,
            communityData
          );
          // await storage.community.upsert(this.crawlDomain, community);
        }
      } else {
        console.log("NO community", communityData);
      }
    } catch (e) {
      // console.log("ERROR community", e.message);

      if (e.data && e.data.error) {
        console.log("DELETE community error", e.data.error);

        await storage.community.delete(
          this.crawlDomain,
          this.crawlCommunity,
          e.data.error.message
        );
        return;
      }

      console.log("DELETE community error", e.message);
      await storage.community.delete(
        this.crawlDomain,
        this.crawlCommunity,
        e.message
      );
    }

    return communityData;

    // the actor id for the community should match the domain https://lemmy.fmhy.ml/c/freemediaheckyeah
    const splitActorId = community.community.actor_id.split("/");
    const urlPart = splitActorId[2];
    const communityPart = splitActorId[4];

    // logging.info("urlPart", urlPart, communityPart);

    if (urlPart != this.crawlDomain) {
      logging.error(
        `[Community] [${this.crawlDomain}/${this.crawlCommunity}] Community actor_id does not match domain: ${community.community.actor_id}`
      );
      return;
    }

    await storage.community.setTrackedAttribute(
      this.crawlDomain,
      communityPart,
      "subscribers",
      community.counts.subscribers
    );

    await storage.community.upsert(this.crawlDomain, community);

    logging.info(
      `[Community] [${this.crawlDomain}/${this.crawlCommunity}] Completed OK (Stored ${communities}/${communityData.length} Local Communities)`
    );
    return communityData;
  }
}
