import logging from "../lib/logging.js";

import InstanceQueue from "../queue/instance.js";
import CommunityQueue from "../queue/community.js";
import SingleCommunityQueue from "../queue/check_comm.js";

import storage from "../storage.js";

import { RECRAWL_AGED_MS, DELETE_AGED_MS } from "../lib/const.js";

export default class CrawlAged {
  constructor() {
    this.agedInstanceBaseUrls = [];
    this.communityCrawler = new SingleCommunityQueue(false);
  }

  addInstance(instanceBaseUrl) {
    if (!this.agedInstanceBaseUrls.includes(instanceBaseUrl)) {
      this.agedInstanceBaseUrls.push(instanceBaseUrl);
    }
  }

  async getAged() {
    logging.info("Fetching Aged Instances", new Date().toLocaleString());

    const instances = await storage.instance.getAll();

    const agedInstances = instances.filter((instance) => {
      if (!instance.lastCrawled) return true; // not set

      if (Date.now() - instance.lastCrawled > RECRAWL_AGED_MS) {
        return true;
      }

      return false;
    });

    logging.info(
      `Instances Total: ${instances.length} Aged: ${agedInstances.length}`
    );

    for (const instance of agedInstances) {
      const baseUrl = instance.siteData.site.actor_id.split("/")[2];
      logging.silly(`Adding Aged Instance: ${baseUrl}`);
      this.addInstance(baseUrl);
    }

    ///
    /// Lemmy Communities
    ///

    const communities = await storage.community.getAll();

    // remove communities not updated in 24h
    let byBase = {};
    const setByBase = (community) => {
      const base = community.community.actor_id.split("/")[2];

      // this should only happen is the entry is older than a certain amount of time
      // pick up really old ones
      if (
        community.lastCrawled &&
        Date.now() - community.lastCrawled > DELETE_AGED_MS
      ) {
        this.communityCrawler.createJob(base, community.community.name);
      }

      if (!byBase[base]) {
        byBase[base] = [community.community.name];
      } else {
        byBase[base].push(community.community.name);
      }
    };

    const agedCommunities = communities.filter((community) => {
      // if (!community) return true;

      if (!community.lastCrawled) {
        // console.log("no lastCrawled", community.community.actor_id);
        setByBase(community);
        return true;
      }

      // if it was last cscanned more then RECRAWL_AGED_MS
      const lastCrawledAgoMs = Date.now() - RECRAWL_AGED_MS;
      if (community.lastCrawled < lastCrawledAgoMs) {
        // console.log(
        //   "ASGED",
        //   community.lastCrawled,
        //   community.community.actor_id
        // );
        setByBase(community);
        return true;
      }

      // console.log("not aged", community.community.actor_id);
      return false;
    });

    logging.info("Aged Communities By Base", byBase);

    for (const community of agedCommunities) {
      const baseUrl = community.community.actor_id.split("/")[2];
      this.addInstance(baseUrl);
    }

    logging.info(
      `Communities Total: ${communities.length} Aged: ${agedCommunities.length}`
    );

    /// CRawl Jobs

    logging.info(
      `Total Aged Instances To Scan: ${this.agedInstanceBaseUrls.length}`
    );
  }

  async createJobs() {
    await this.getAged();

    const instanceCrawler = new InstanceQueue(false);
    const communityCrawler = new CommunityQueue(false);
    for (const baseUrl of this.agedInstanceBaseUrls) {
      await instanceCrawler.createJob(baseUrl);
      await communityCrawler.createJob(baseUrl);
    }

    logging.info("Done Creating Aged Jobs");
  }
}
