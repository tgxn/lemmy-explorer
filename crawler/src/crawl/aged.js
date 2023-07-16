import logging from "../lib/logging.js";

import InstanceQueue from "../queue/instance.js";
import CommunityQueue from "../queue/community.js";
import SingleCommunityQueue from "../queue/check_comm.js";
import KBinQueue from "../queue/kbin.js";

import storage from "../storage.js";

import { CRAWL_AGED_TIME, CRAWL_DELETE_TIME } from "../lib/const.js";

export default class CrawlAged {
  constructor() {
    this.agedInstanceBaseUrls = [];

    this.instanceCrawler = new InstanceQueue(false);
    this.communityCrawler = new CommunityQueue(false);
    this.singleCommunityCrawler = new SingleCommunityQueue(false);

    // @TODO scan for aged kbin magazines
    this.kbinCrawler = new KBinQueue(false);
  }

  addInstance(instanceBaseUrl) {
    if (!this.agedInstanceBaseUrls.includes(instanceBaseUrl)) {
      this.agedInstanceBaseUrls.push(instanceBaseUrl);
    }
  }

  async getAged() {
    logging.info("Fetching Aged Instances");

    const instances = await storage.instance.getAll();

    const agedInstances = instances.filter((instance) => {
      if (!instance.lastCrawled) return true; // not set

      if (Date.now() - instance.lastCrawled > CRAWL_AGED_TIME.INSTANCE) {
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
        Date.now() - community.lastCrawled > CRAWL_DELETE_TIME.COMMUNITY
      ) {
        this.singleCommunityCrawler.createJob(base, community.community.name);
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

      // is this record aged?
      const lastCrawledAgoMs = Date.now() - CRAWL_AGED_TIME.COMMUNITY;
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

    logging.info("Aged Communities By Base", Object.keys(byBase).length);

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

    for (const baseUrl of this.agedInstanceBaseUrls) {
      await this.instanceCrawler.createJob(baseUrl);
      await this.communityCrawler.createJob(baseUrl);
    }

    logging.info("Done Creating Aged Jobs");
  }
}
