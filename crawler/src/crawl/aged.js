import CrawlInstance from "./instance.js";
import CrawlCommunity from "./communities.js";

import {
  listInstanceData,
  listCommunityData,
  listFediverseData,
} from "../lib/storage.js";

import { OUTPUT_MAX_AGE_MS } from "../lib/const.js";

export default class CrawlAged {
  constructor() {
    this.agedInstanceBaseUrls = [];
  }

  addInstance(instanceBaseUrl) {
    if (!this.agedInstanceBaseUrls.includes(instanceBaseUrl)) {
      this.agedInstanceBaseUrls.push(instanceBaseUrl);
    }
  }

  async createJobs() {
    console.log("Running Aged Cron Task", new Date().toLocaleString());

    const instances = await listInstanceData();

    const agedInstances = instances.filter((instance) => {
      if (!instance.lastCrawled) return true; // not set

      if (Date.now() - instance.lastCrawled > OUTPUT_MAX_AGE_MS) {
        return true;
      }

      return false;
    });

    console.log(
      `Instances Total: ${instances.length} Aged: ${agedInstances.length}`
    );

    for (const instance of agedInstances) {
      const baseUrl = instance.siteData.site.actor_id.split("/")[2];
      // console.log(`Aged Instance: ${baseUrl}`);
      this.addInstance(baseUrl);
    }

    ///
    /// Lemmy Communities
    ///

    const communities = await listCommunityData();

    // remove communities not updated in 24h
    const agedCommunities = communities.filter((community) => {
      if (!community.lastCrawled) return true;

      if (Date.now() - community.lastCrawled > OUTPUT_MAX_AGE_MS) {
        return true;
      }

      return false;
    });

    for (const community of agedCommunities) {
      const baseUrl = community.community.actor_id.split("/")[2];
      this.addInstance(baseUrl);
    }

    console.log(
      `Communities Total: ${communities.length} Aged: ${agedCommunities.length}`
    );

    /// CRawl Jobs

    console.log(
      `Total Aged Instances To Scan: ${this.agedInstanceBaseUrls.length}`
    );

    const crawler = new CrawlInstance();
    for (const baseUrl of this.agedInstanceBaseUrls) {
      crawler.createJob(baseUrl);
    }
  }
}
