import type { IErrorData } from "../../../types/storage";

import logging from "../lib/logging";

import storage from "../lib/crawlStorage";
import { IFediverseDataKeyValue } from "../../../types/storage";
import { IMagazineData } from "../../../types/storage";

import { CrawlError, CrawlTooRecentError } from "../lib/error";

import { IJobProcessor } from "../queue/BaseQueue";

import MBinQueue from "../queue/mbin";

import CrawlClient from "../lib/CrawlClient";

import { CRAWL_AGED_TIME } from "../lib/const";

const TIME_BETWEEN_PAGES = 2000;

const RETRY_COUNT = 2;
const RETRY_PAGE_COUNT = 2;
const TIME_BETWEEN_RETRIES = 1000;

const PAGE_TIMEOUT = 5000;

export type IIncomingMagazineData = {
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

  private mbinQueue: MBinQueue;

  private client: CrawlClient;

  constructor() {
    this.fediverseData = null;
    this.logPrefix = `[CrawlMBin]`;

    this.mbinQueue = new MBinQueue(false);

    this.client = new CrawlClient();
  }

  /**
   * - `/api/federated` to get list of federated instances
   * - `/api/info` to get instance info
   * - `/api/magazines` to get list of magazines
   * - `/api/magazine/{magazine_id}` to get magazine info
   */

  // scan the full list of fediverse marked instances with "mbin"
  async createJobsAllMBin() {
    try {
      // get all fedi mbin servers
      const mbinServers = await this.getInstances();
      logging.info(`MBin Instances Total: ${mbinServers.length}`);

      const mbinQueue = new MBinQueue(false);
      for (const mbinServer of mbinServers) {
        this.logPrefix = `[CrawlMBin] [${mbinServer.base}]`;
        console.log(`${this.logPrefix} create job ${mbinServer.base}`);

        await mbinQueue.createJob(mbinServer.base);
      }
    } catch (e) {
      console.error(`${this.logPrefix} error scanning mbin instance`, e);
    }
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

    return mbinFedServersDateFiltered;
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

  async crawlFederatedInstances(crawlDomain: string) {
    const fedReq = await this.client.getUrlWithRetry("https://" + crawlDomain + "/api/federated");

    const federatedInstances = fedReq.data.instances;

    console.log(`${this.logPrefix} [${crawlDomain}] federatedInstances`, federatedInstances.length);

    for (var instance of federatedInstances) {
      // if it has a software and domain, we put it in fediverse table
      if (instance.domain && instance.software) {
        await storage.fediverse.upsert(instance.domain, {
          name: instance.software,
          version: instance.version,
          time: Date.now(),
        });
        // console.log(`${this.logPrefix} [${crawlDomain}] upserted ${instance.software}:${instance.domain}`);
      }

      if (instance.software === "mbin") {
        console.log(`${this.logPrefix} [${crawlDomain}] create job ${instance.domain}`);
        this.mbinQueue.createJob(instance.domain);
      }
    }

    return federatedInstances;
  }

  async crawlMagazinesData(crawlDomain: string, pageNumber: number = 1): Promise<IIncomingMagazineData[]> {
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

      const subPromises = await this.crawlMagazinesData(crawlDomain, pageNumber + 1);
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
      if (e.response?.status === 404 && pageNumber > 1) {
        return [];
      }

      // throw new CrawlError("Failed to get community page");
      throw new CrawlError(e.message, e);
    }
  }

  // validate the community is for the domain being scanned, and save it
  async storeMagazineData(crawlDomain: string, magazineData: IIncomingMagazineData) {
    const outMagazineData: IMagazineData = {
      baseurl: crawlDomain,
      ...magazineData,

      icon: magazineData?.icon?.storageUrl ? magazineData.icon.storageUrl : null,
      lastCrawled: Date.now(),
    };

    await storage.mbin.upsert(crawlDomain, outMagazineData);

    await storage.mbin.setTrackedAttribute(
      crawlDomain,
      magazineData.name,
      "subscriptionsCount",
      magazineData.subscriptionsCount,
    );

    await storage.mbin.setTrackedAttribute(
      crawlDomain,
      magazineData.name,
      "postCount",
      magazineData.postCount,
    );

    await storage.mbin.setTrackedAttribute(
      crawlDomain,
      magazineData.name,
      "postCommentCount",
      magazineData.postCommentCount,
    );

    return true;
  }
}

export const mbinInstanceProcessor: IJobProcessor<IIncomingMagazineData[] | null> = async ({ baseUrl }) => {
  const startTime = Date.now();

  if (!baseUrl) {
    logging.error(`[MBinQueue] No baseUrl provided for mbin instance`);
    throw new CrawlError("No baseUrl provided for mbin instance");
  }

  try {
    // check for recent scan of this mbin instance
    const lastCrawl = await storage.tracking.getLastCrawl("mbin", baseUrl);
    if (lastCrawl) {
      const lastCrawledMsAgo = Date.now() - lastCrawl.time;
      throw new CrawlTooRecentError(`Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`);
    }

    // check for recent error
    const lastError = await storage.tracking.getOneError("mbin", baseUrl);
    if (lastError?.time) {
      const lastErrorTime = lastError.time;
      const now = Date.now();

      throw new CrawlTooRecentError(`Skipping - Error too recently (${(now - lastErrorTime) / 1000}s ago)`);
    }

    const crawler = new CrawlMBin();

    const instanceData = await crawler.crawlInstanceData(baseUrl);

    await crawler.crawlFederatedInstances(baseUrl);

    const magazinesData: IIncomingMagazineData[] = await crawler.crawlMagazinesData(baseUrl);

    console.log("magazinesData", magazinesData.length);
    // console.log("magazinesData", magazinesData[0]);

    await storage.tracking.setLastCrawl("mbin", `${baseUrl}`, instanceData);

    await storage.tracking.setLastCrawl("mbin", baseUrl, {
      duration: (Date.now() - startTime) / 1000,
    });

    return magazinesData;
  } catch (error) {
    if (error instanceof CrawlTooRecentError) {
      logging.warn(`[MBinQueue] [${baseUrl}] CrawlTooRecentError: ${error.message}`);
      return null;
    }

    const errorDetail: IErrorData = {
      error: error.message,
      stack: error.stack,
      isAxiosError: error.isAxiosError,
      code: error.code,
      url: error.url,
      time: new Date().getTime(),
      duration: Date.now() - startTime,
    };

    await storage.tracking.upsertError("mbin", baseUrl, errorDetail);

    logging.error(`[MBinQueue] [${baseUrl}] Error: ${error.message}`);
  }

  return null;
};
