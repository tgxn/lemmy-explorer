import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";

import logging from "../lib/logging";

import storage from "../lib/crawlStorage";
import { IFediverseDataKeyValue } from "../lib/storage/fediverse";

import { CrawlError, CrawlTooRecentError } from "../lib/error";

import MBinQueue from "../queue/mbin";
import InstanceQueue from "../queue/instance";

import CrawlClient from "../lib/CrawlClient";

import { CRAWL_AGED_TIME } from "../lib/const";

const TIME_BETWEEN_PAGES = 2000;

const RETRY_COUNT = 2;
const RETRY_PAGE_COUNT = 2;
const TIME_BETWEEN_RETRIES = 1000;

const PAGE_TIMEOUT = 5000;

type IIncomingMagazineData = {
  magazineId: number;
  owner: {
    magazineId: number;
    userId: number;
    avatar: any;
    username: string;
    apId: any;
  };
  icon: any;
  name: string;
  title: string;
  description: string;
  rules: string;
  subscriptionsCount: number;
  entryCount: number;
  entryCommentCount: number;
  postCount: number;
  postCommentCount: number;
  isAdult: boolean;
  isUserSubscribed: any;
  isBlockedByUser: any;
  tags: any;
  badges: any[];
  moderators: {
    magazineId: number;
    userId: number;
    avatar: any;
    username: string;
    apId: any;
  }[];
  apId: any;
  apProfileId: string;
  serverSoftware: any;
  serverSoftwareVersion: any;
  isPostingRestrictedToMods: boolean;
};

export default class CrawlMBin {
  private fediverseData: IFediverseDataKeyValue | null;
  private logPrefix: string;

  private instanceQueue: InstanceQueue;

  private client: CrawlClient;

  constructor() {
    this.fediverseData = null;
    this.logPrefix = `[CrawlMBin]`;

    this.instanceQueue = new InstanceQueue(false);

    this.client = new CrawlClient();
  }

  async getInstances() {
    this.fediverseData = await storage.fediverse.getAll();

    const mbinFedServersDateFiltered = Object.entries(this.fediverseData)
      .filter((fediServer) => {
        return fediServer[1].name === "mbin";
      })

      .filter((fediServer) => {
        if (!fediServer[1].time) return true;

        // remove all mbin instanced not crawled in the last 24 hours
        return Date.now() - fediServer[1].time < CRAWL_AGED_TIME.FEDIVERSE;
      })

      .map((fediServer) => {
        return {
          base: fediServer[0].replace("fediverse:", ""),
          ...fediServer[1],
        };
      });

    logging.info("mb", mbinFedServersDateFiltered.length);

    const instanceData = await this.crawlInstanceData("fedia.io");

    const magazinesData = await this.getMagazinesData("fedia.io");

    console.log("magazinesData", magazinesData.length);
    console.log("magazinesData", magazinesData[0]);

    return mbinFedServersDateFiltered;
  }

  // scan the full list of fediverse marked instances with "kbin"
  async createJobsAllMBin() {
    try {
      // get all fedi kbin servers
      const mbinServers = await this.getInstances();
      logging.info(`MBin Instances Total: ${mbinServers.length}`);

      const mbinQueue = new MBinQueue(false);
      for (const mbinServer of mbinServers) {
        this.logPrefix = `[CrawlMBin] [${mbinServer.base}]`;
        console.log(`${this.logPrefix} create job ${mbinServer.base}`);

        await mbinQueue.createJob(mbinServer.base);
      }
    } catch (e) {
      console.error(`${this.logPrefix} error scanning kbin instance`, e);
    }
  }

  async crawlInstanceData(crawlDomain: string) {
    const nodeInfo = await this.getNodeInfo(crawlDomain);

    console.log(`${this.logPrefix} [${crawlDomain}] nodeInfo`, nodeInfo);

    if (!nodeInfo.software) {
      throw new CrawlError("no software key found for " + crawlDomain);
    }

    // store all fediverse instance software for easy metrics
    await storage.fediverse.upsert(crawlDomain, nodeInfo.software);

    // only allow mbin instances
    if (nodeInfo.software.name != "mbin") {
      throw new CrawlError(`not a mbin instance (${nodeInfo.software.name})`);
    }

    const [siteInfo, siteHeaders] = await this.getSiteInfo(crawlDomain);
    console.log(`${crawlDomain}: found mbin instance`, siteHeaders, siteInfo);
    // console.log(`${crawlDomain}: found mbin instance`, siteHeaders);

    // if (siteInfo.websiteDomain !== crawlDomain) {
    //   console.error(`${crawlDomain}: mismatched domain`, siteInfo.websiteDomain);
    //   throw new CrawlError(`${crawlDomain}: mismatched domain`, siteInfo.websiteDomain);
    // }

    if (siteInfo.websiteDomain !== crawlDomain) {
      console.error(
        `${crawlDomain}: actor id does not match instance domain: ${siteInfo.websiteDomain} !== ${crawlDomain}`,
      );
      throw new CrawlError(
        `${crawlDomain}: actor id does not match instance domain: ${siteInfo.websiteDomain} !== ${crawlDomain}`,
      );
    }

    return siteInfo;
  }

  async getNodeInfo(crawlDomain: string) {
    const wellKnownUrl = "https://" + crawlDomain + "/.well-known/nodeinfo";

    console.log(`${this.logPrefix} [${crawlDomain}] wellKnownUrl`, wellKnownUrl);

    const wellKnownInfo = await this.client.getUrlWithRetry(
      wellKnownUrl,
      {
        timeout: 10000, // smaller for nodeinfo
      },
      2,
    );

    let nodeinfoUrl: string | null = null;
    if (!wellKnownInfo.data.links) {
      throw new CrawlError("missing /.well-known/nodeinfo links");
    }

    for (var linkRel of wellKnownInfo.data.links) {
      if (
        linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0" ||
        linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.1"
      ) {
        nodeinfoUrl = linkRel.href;
      }
    }
    if (!nodeinfoUrl) {
      throw new CrawlError("no diaspora rel in /.well-known/nodeinfo");
    }

    const nodeNodeInfoData = await this.client.getUrlWithRetry(nodeinfoUrl);
    return nodeNodeInfoData.data;
  }

  async getSiteInfo(crawlDomain: string) {
    const siteInfo = await this.client.getUrlWithRetry("https://" + crawlDomain + "/api/info");

    return [siteInfo.data, siteInfo.headers];
  }

  async getMagazinesData(crawlDomain: string, pageNumber: number = 1): Promise<IIncomingMagazineData[]> {
    const communities = await this.getPageData(crawlDomain, pageNumber);

    logging.debug(`${this.logPrefix} Page ${pageNumber}, Results: ${communities.length}`);

    //  promises track the upsert of Magazine data
    let magazinesData: IIncomingMagazineData[] = communities;

    // if this page had non-zero results
    if (communities.length > 0) {
      // upsert the page's magazine's data
      let promises: Promise<any>[] = [];
      for (var magazineData of communities) {
        promises.push(this.storeMagazineData(crawlDomain, magazineData));
      }
      await Promise.all(promises);

      // sleep between pages
      await new Promise((resolve) => setTimeout(resolve, TIME_BETWEEN_PAGES));

      const subPromises = await this.getMagazinesData(crawlDomain, pageNumber + 1);
      if (subPromises.length > 0) {
        magazinesData.push(...subPromises);
      }
    }

    return magazinesData;
  }

  async getPageData(crawlDomain: string, pageNumber: number = 1): Promise<IIncomingMagazineData[]> {
    logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

    try {
      let magazineList = await this.client.getUrlWithRetry(
        "https://" + crawlDomain + "/api/magazines",
        {
          params: {
            p: pageNumber,
            perPage: 50,
            federation: "local",
            hide_adult: "show",
          },
          timeout: PAGE_TIMEOUT,
        },
        RETRY_PAGE_COUNT, // retry count per-page
      );

      const magazines = magazineList.data.items;

      // must be an array
      if (!Array.isArray(magazines)) {
        logging.error(`${this.logPrefix} Community list not an array:`, magazineList.data.substr(0, 15));
        throw new CrawlError(`Community list not an array: ${magazines}`);
      }

      return magazines;
    } catch (e) {
      // mbin will return a 404 at the end of results
      if (e.response.status === 404 && pageNumber > 1) {
        return [];
      }

      // throw new CrawlError("Failed to get community page");
      throw new CrawlError(e.message, e);
    }
  }

  // validate the community is for the domain being scanned, and save it
  async storeMagazineData(crawlDomain: string, magazineData: IIncomingMagazineData) {
    // const { basePart, communityPart } = this.splitCommunityActorParts(community.community.actor_id);

    // console.log(`${this.logPrefix} [${magazineData.name}]`);

    // validate the community actor_id matches the domain
    // if (basePart != this.crawlDomain || communityPart != community.community.name) {
    //   logging.error(
    //     `${this.logPrefix} Community actor_id does not match domain: ${community.community.actor_id} ${community.community.name}`,
    //   );
    //   return false;
    // }

    await storage.mbin.upsert(crawlDomain, magazineData);

    // await storage.community.setTrackedAttribute(
    //   this.crawlDomain,
    //   communityPart,
    //   "subscribers",
    //   community.counts.subscribers,
    // );

    // if (community.counts.hot_rank) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "hot_rank",
    //     community.counts.hot_rank,
    //   );
    // }

    // if (community.counts.posts) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "posts",
    //     community.counts.posts,
    //   );
    // }

    // if (community.counts.comments) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "comments",
    //     community.counts.comments,
    //   );
    // }

    // if (community.counts.users_active_day) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "users_active_day",
    //     community.counts.users_active_day,
    //   );
    // }

    // if (community.counts.users_active_week) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "users_active_week",
    //     community.counts.users_active_week,
    //   );
    // }

    // if (community.counts.users_active_month) {
    //   await storage.community.setTrackedAttribute(
    //     this.crawlDomain,
    //     communityPart,
    //     "users_active_month",
    //     community.counts.users_active_month,
    //   );
    // }

    return true;
  }

  /**
   * - `/api/federated` to get list of federated instances
   * - `/api/info` to get instance info
   * - `/api/magazines` to get list of magazines
   * - `/api/magazine/{magazine_id}` to get magazine info
   */

  // // scan the full list of fediverse marked instances with "kbin"
  // async createJobsAllKBin() {
  //   try {
  //     // get all fedi kbin servers
  //     const kbinServers = await this.getKBin();
  //     logging.info(`KBin Instances Total: ${kbinServers.length}`);

  //     const kbinQueue = new KBinQueue(false);
  //     for (const kbinServer of kbinServers) {
  //       this.logPrefix = `[CrawlKBin] [${kbinServer.base}]`;
  //       console.log(`${this.logPrefix} create job ${kbinServer.base}`);

  //       await kbinQueue.createJob(kbinServer.base);
  //     }
  //   } catch (e) {
  //     console.error(`${this.logPrefix} error scanning kbin instance`, e);
  //   }
  // }

  // // scan a single kbin instance's magazines
  // async processOneInstance(kbinBaseUrl) {
  //   let sketchyList = await this.getSketch(kbinBaseUrl);
  //   sketchyList = sketchyList.filter((mag) => mag != "");
  //   // fix spaces
  //   sketchyList = sketchyList.map((mag) => {
  //     if (mag.indexOf(" ") !== -1) {
  //       return mag.split(" ")[0];
  //     }
  //     return mag;
  //   });

  //   const localMagazines = sketchyList.filter((mag) => {
  //     if (mag.indexOf("@") !== -1) {
  //       return false;
  //     }
  //     return true;
  //   });

  //   const nonLocalMagazines = sketchyList.filter((mag) => {
  //     if (mag.indexOf("@") !== -1) {
  //       return true;
  //     }
  //     return false;
  //   });

  //   console.log(
  //     `${this.logPrefix} [${kbinBaseUrl}] local: ${localMagazines.length} others: ${nonLocalMagazines.length} `,
  //   );

  //   if (localMagazines.length > 0) {
  //     for (const mag of localMagazines) {
  //       try {
  //         // check for recent scan of this magazine
  //         const lastCrawl = await storage.tracking.getLastCrawl("magazine", `${kbinBaseUrl}:${mag}`);
  //         if (lastCrawl) {
  //           const lastCrawledMsAgo = Date.now() - lastCrawl.time;
  //           throw new CrawlTooRecentError(
  //             `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`,
  //           );
  //         }

  //         await this.getStoreMag(kbinBaseUrl, mag);
  //       } catch (e) {
  //         console.error(`${this.logPrefix} error scanning kbin MAG`, kbinBaseUrl, mag, e.message);
  //       }
  //       // await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }
  //   }

  //   // create kbin job to scan non-local baseurls
  //   if (nonLocalMagazines.length > 0) {
  //     // const kbinQueue = new KBinQueue(false);
  //     for (const otherName of nonLocalMagazines) {
  //       // console.log(`${this.logPrefix} otherName`, otherName);

  //       const split = otherName.split("@");
  //       // console.log(`${this.logPrefix} split`, split);

  //       if (split.length === 2) {
  //         // must have two parts, we only want the second bit after the @
  //         // add to the instance queue to validate it is a kbin instance
  //         await this.instanceQueue.createJob(split[1]);
  //       }
  //     }
  //   }

  //   return;
  // }

  // async getStoreMag(kbinBaseUrl: string, mag) {
  //   const magazineInfo = await this.getMagazineInfo(kbinBaseUrl, mag);

  //   if (magazineInfo.type === "Group") {
  //     const followerData = await this.getFollowupData(magazineInfo.followers);
  //     const followers = followerData.totalItems;

  //     console.log(`got followers`, followers);

  //     // save group
  //     const saveGroup = {
  //       baseurl: kbinBaseUrl,
  //       followerCount: followers,
  //       title: magazineInfo.name,

  //       // name must overide the name from the api
  //       ...magazineInfo,
  //       name: mag,
  //     };
  //     await storage.kbin.upsert(kbinBaseUrl, saveGroup);
  //     await storage.tracking.setLastCrawl("magazine", `${kbinBaseUrl}:${mag}`, {
  //       followers,
  //     });

  //     logging.info(`${this.logPrefix} mag: ${mag} Saved KBin Magazine`);
  //   } else {
  //     console.log(`${this.logPrefix} mag: ${mag} is not a group`, magazineInfo);
  //   }

  //   return;
  // }

  // // this calls the current method from here https://github.com/tgxn/lemmy-explorer/issues/100#issuecomment-1617444934
  // async getSketch(baseUrl) {
  //   var currentPath = process.cwd();
  //   const printHelloCommand = `/bin/bash ${path.join(currentPath, "src", "crawl", "sketch.sh")} ${baseUrl}`;
  //   const results = await execAsync(printHelloCommand);
  //   // console.log(results.stdout);

  //   const mappedArray = results.stdout.split("\n");

  //   if (!Array.isArray(mappedArray)) {
  //     throw new CrawlError(`failed to get sketch (${baseUrl}): ${results.stdout}`);
  //   }

  //   return mappedArray;
  // }

  // // uses non-documented api on instances to get a json list of all kbin magazine data
  // async getMagazineInfo(baseUrl, magazineName) {
  //   console.log(`${this.logPrefix} getMagazineInfo`, "https://" + baseUrl + "/m/" + magazineName);
  //   const magazineInfo = await this.client.getUrlWithRetry(
  //     "https://" + baseUrl + "/m/" + magazineName,
  //     {
  //       headers: {
  //         "Content-Type": "application/ld+json",
  //         Accept: "application/ld+json",
  //       },
  //     },
  //     1,
  //   );

  //   return magazineInfo.data;
  // }

  // async getFollowupData(wellKnownUrl) {
  //   const wellKnownInfo = await this.client.getUrlWithRetry(
  //     wellKnownUrl,
  //     {
  //       headers: {
  //         "Content-Type": "application/ld+json",
  //         Accept: "application/ld+json",
  //       },
  //     },
  //     3,
  //   );
  //   return wellKnownInfo.data;
  // }

  // // get list of all known kbin servers
  // async getKBin() {
  //   logging.info("Fetching KBin Instances");

  //   this.fediverseData = await storage.fediverse.getAll();

  //   const kbinFedServers = Object.entries(this.fediverseData)
  //     .filter((fediServer) => {
  //       return fediServer[1].name === "kbin";
  //     })
  //     .map((fediServer) => {
  //       return {
  //         base: fediServer[0].replace("fediverse:", ""),
  //         ...fediServer[1],
  //       };
  //     });

  //   return kbinFedServers;
  // }
}
