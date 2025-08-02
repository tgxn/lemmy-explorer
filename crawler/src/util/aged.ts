import logging from "../lib/logging";

import InstanceQueue from "../queue/instance";
import CommunityQueue from "../queue/community_list";
import SingleCommunityQueue from "../queue/community_single";
import MBinQueue from "../queue/mbin";
import PiefedQueue from "../queue/piefed";

import storage from "../lib/crawlStorage";

import { CRAWL_AGED_TIME, CRAWL_DELETE_TIME } from "../lib/const";

export default class CrawlAged {
  private agedInstanceBaseUrls: string[];

  private instanceCrawler: InstanceQueue;
  private communityCrawler: CommunityQueue;
  private singleCommunityCrawler: SingleCommunityQueue;
  private mbinCrawler: MBinQueue;
  private piefedCrawler: PiefedQueue;

  constructor() {
    this.agedInstanceBaseUrls = [];

    this.instanceCrawler = new InstanceQueue(false);
    this.communityCrawler = new CommunityQueue(false);
    this.singleCommunityCrawler = new SingleCommunityQueue(false);

    // scan for aged magazines
    this.mbinCrawler = new MBinQueue(false);
    // piefed communities
    this.piefedCrawler = new PiefedQueue(false);
  }

  async recordAges() {
    // get all communities, instances, fediverse and magazine records, and get age distribution

    const instances = await storage.instance.getAll();
    const communities = await storage.community.getAll();
    const magazines = await storage.mbin.getAll();
    const piefed_communities = await storage.piefed.getAll();
    const fediverse = await storage.fediverse.getAll();
    const errors = await storage.tracking.getAllErrors("*");
    const lastCrawls = await storage.tracking.listAllLastCrawl();

    logging.info("Record Counts", magazines.length);

    const healthData: any = [];

    // get age distribution
    function getAgeDistribution(records, attribute) {
      const buckets = {
        "1-2 hours": 0,
        "2-4 hours": 0,
        "4-6 hours": 0,
        "6-8 hours": 0,
        "8-10 hours": 0,
        "10-12 hours": 0,
        "12+ hours": 0,
      };

      const now = Date.now();
      const ages = records.map((record) => {
        // not sure why this would fail, but it seems that sometimes fediseer{"time"] is empty.
        try {
          const age = now - record[attribute];

          // sort into hourly buckets: 1-2 hours, 2-4 hours, 4-6 hours, 6+ hours
          if (age < 2 * 60 * 60 * 1000) {
            buckets["1-2 hours"]++;
          } else if (age < 4 * 60 * 60 * 1000) {
            buckets["2-4 hours"]++;
          } else if (age < 6 * 60 * 60 * 1000) {
            buckets["4-6 hours"]++;
          } else if (age < 8 * 60 * 60 * 1000) {
            buckets["6-8 hours"]++;
          } else if (age < 10 * 60 * 60 * 1000) {
            buckets["8-10 hours"]++;
          } else if (age < 12 * 60 * 60 * 1000) {
            buckets["10-12 hours"]++;
          } else {
            buckets["12+ hours"]++;
          }

          return age;
        } catch (e) {
          logging.error(record, e);

          return 0;
        }
      });

      return {
        min: Math.min(...ages),
        max: Math.max(...ages),
        avg: ages.reduce((a, b) => a + b, 0) / ages.length,
        buckets,
      };
    }

    const instanceAgeDistribution = getAgeDistribution(instances, "lastCrawled");
    healthData.push({
      table: "Instances",
      ...instanceAgeDistribution.buckets,
    });

    const communityAgeDistribution = getAgeDistribution(communities, "lastCrawled");
    healthData.push({
      table: "Communities",
      ...communityAgeDistribution.buckets,
    });

    const magazineAgeDistribution = getAgeDistribution(magazines, "lastCrawled");
    healthData.push({
      table: "Magazines",
      ...magazineAgeDistribution.buckets,
    });

    const piefedCommunitiesAgeDistribution = getAgeDistribution(piefed_communities, "lastCrawled");
    healthData.push({
      table: "PiefedCommunities",
      ...piefedCommunitiesAgeDistribution.buckets,
    });

    const fediverseAgeDistribution = getAgeDistribution(Object.values(fediverse), "time");
    healthData.push({
      table: "Fediverse",
      ...fediverseAgeDistribution.buckets,
    });

    const lastCrawlAgeDistribution = getAgeDistribution(Object.values(lastCrawls), "time");
    healthData.push({
      table: "Last Crawl",
      ...lastCrawlAgeDistribution.buckets,
    });

    const errorAgeDistribution = getAgeDistribution(Object.values(errors), "time");
    healthData.push({
      table: "Errors",
      ...errorAgeDistribution.buckets,
    });

    logging.info("Data Age Distribution");
    logging.table(healthData, [
      "table",
      "1-2 hours",
      "2-4 hours",
      "4-6 hours",
      "6-8 hours",
      "8-10 hours",
      "10-12 hours",
      "12+ hours",
    ]);
  }

  addInstance(instanceBaseUrl: string) {
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

    logging.info(`Instances Total: ${instances.length} Aged: ${agedInstances.length}`);

    for (const instance of agedInstances) {
      const baseUrl = instance.siteData.site.actor_id.split("/")[2];
      logging.info(`Adding Aged Instance: ${baseUrl}`);
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
      if (community.lastCrawled && Date.now() - community.lastCrawled > CRAWL_DELETE_TIME.COMMUNITY) {
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
        logging.warn("no lastCrawled", community.community.actor_id);
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

    logging.info("Aged Communities By Base (showing over 100 communities)", Object.keys(byBase).length);

    const baseCounts = Object.keys(byBase)
      .map((base) => {
        return {
          base,
          count: byBase[base].length,
        };
      })
      .sort((a, b) => a.count - b.count)
      .filter((a) => a.count > 100);

    logging.table(baseCounts);

    for (const community of agedCommunities) {
      const baseUrl = community.community.actor_id.split("/")[2];
      this.addInstance(baseUrl);
    }

    logging.info(`Communities Total: ${communities.length} Aged: ${agedCommunities.length}`);

    /// CRawl Jobs

    logging.info(`Total Aged Instances To Scan: ${this.agedInstanceBaseUrls.length}`);
  }

  async createJobs() {
    await this.getAged();

    for (const baseUrl of this.agedInstanceBaseUrls) {
      await this.instanceCrawler.createJob(baseUrl);
      await this.communityCrawler.createJob(baseUrl);
    }

    // get aged magazines
    const magazines = await storage.mbin.getAll();

    const agedMagazines = Object.values(magazines).filter((magazine) => {
      if (!magazine.lastCrawled) return true; // not set

      if (Date.now() - magazine.lastCrawled > CRAWL_AGED_TIME.MAGAZINE) {
        return true;
      }

      return false;
    });

    // get base url for each magazine
    const agedMagazineBaseUrls = agedMagazines.map((magazine) => magazine.baseurl);

    // filter those dupes
    const uniqueAgedMagazineBaseUrls = [...new Set(agedMagazineBaseUrls)];

    logging.info(
      `Magazines Total: ${magazines.length} Aged ${agedMagazineBaseUrls.length}, Total Instances: ${uniqueAgedMagazineBaseUrls.length}`,
    );
    for (const baseUrl of uniqueAgedMagazineBaseUrls) {
      this.mbinCrawler.createJob(baseUrl);
    }

    // get aged piefed communities
    const piefedCommunities = await storage.piefed.getAll();

    const agedPiefedCommunities = Object.values(piefedCommunities).filter((piefed_community) => {
      if (!piefed_community.lastCrawled) return true; // not set

      if (Date.now() - piefed_community.lastCrawled > CRAWL_AGED_TIME.COMMUNITY) {
        return true;
      }

      return false;
    });

    // get base url for each magazine
    const agedPiefedCommunityBaseUrls = agedPiefedCommunities.map(
      (piefed_community) => piefed_community.baseurl,
    );

    // filter those dupes
    const uniqueAgedPiefedCommunityBaseUrls = [...new Set(agedPiefedCommunityBaseUrls)];

    logging.info(
      `Piefed Communities Total: ${piefedCommunities.length} Aged ${agedPiefedCommunityBaseUrls.length}, Total Instances: ${uniqueAgedPiefedCommunityBaseUrls.length}`,
    );

    for (const baseUrl of uniqueAgedPiefedCommunityBaseUrls) {
      this.piefedCrawler.createJob(baseUrl);
    }

    logging.info("Done Creating Aged Jobs");
  }
}
