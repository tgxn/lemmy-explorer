import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";

import logging from "../lib/logging";

import storage from "../lib/crawlStorage";
import { IFediverseDataKeyValue } from "../../../types/storage";
import { IPiefedCommunityData } from "../../../types/storage";

import { CrawlError, CrawlTooRecentError } from "../lib/error";

import { IJobProcessor } from "../queue/BaseQueue";

import PiefedQueue from "../queue/piefed";

import CrawlClient from "../lib/CrawlClient";

import { CRAWL_AGED_TIME } from "../lib/const";

import { getActorBaseUrl } from "../lib/validator";

const TIME_BETWEEN_PAGES = 2000;

const RETRY_COUNT = 2;
const RETRY_PAGE_COUNT = 2;
const TIME_BETWEEN_RETRIES = 1000;

const PAGE_TIMEOUT = 5000;

type IIncomingPiefedCommunityData = {
  activity_alert: boolean;
  blocked: boolean;
  community: {
    actor_id: string;
    ap_domain: string;
    banned: boolean;
    deleted: boolean;
    hidden: boolean;
    icon: string | null;
    id: number;
    instance_id: number;
    local: boolean;
    name: string;
    nsfw: boolean;
    published: string;
    removed: boolean;
    restricted_to_mods: boolean;
    title: string;
    updated: string | null;
  };
  counts: {
    id: number;
    post_count: number;
    post_reply_count: number;
    subscriptions_count: number;
    total_subscriptions_count: number;
    active_daily: number;
    active_weekly: number;
    active_monthly: number;
    active_6monthly: number;
    published: string;
  };
  subscribed: string;
  lastCrawled: number;
};

export default class CrawlPiefed {
  private fediverseData: IFediverseDataKeyValue | null;
  private logPrefix: string;

  private piefedQueue: PiefedQueue;

  private client: CrawlClient;

  constructor() {
    this.fediverseData = null;
    this.logPrefix = `[CrawlPiefed]`;

    this.piefedQueue = new PiefedQueue(false);

    this.client = new CrawlClient();
  }

  /**
   * - `/api/alpha/federated_instances` to get list of federated instances
   * - `/api/v3/site` to get instance info
   * - `/api/alpha/community/list` to get list of communities
   * - `/api/alpha/community` to get community info
   */

  // scan the full list of fediverse marked instances with "piefed"
  async createJobsAllPiefed() {
    try {
      // get all fedi piefed servers
      const piefedServers = await this.getInstances();
      logging.info(`Piefed Instances Total: ${piefedServers.length}`);

      const piefedQueue = new PiefedQueue(false);
      for (const piefedServer of piefedServers) {
        this.logPrefix = `[CrawlPiefed] [${piefedServer.base}]`;
        console.log(`${this.logPrefix} create job ${piefedServer.base}`);

        await piefedQueue.createJob(piefedServer.base);
      }
    } catch (e) {
      console.error(`${this.logPrefix} error scanning piefed instance`, e);
    }
  }

  async getInstances() {
    this.fediverseData = await storage.fediverse.getAll();

    const piefedFedServersDateFiltered = Object.entries(this.fediverseData)
      .filter((fediServer) => {
        return fediServer[1].name === "piefed";
      })

      .filter((fediServer) => {
        if (!fediServer[1].time) return true;

        // remove all piefed instanced not crawled in the last 24 hours
        return Date.now() - fediServer[1].time < CRAWL_AGED_TIME.FEDIVERSE;
      })

      .map((fediServer) => {
        return {
          base: fediServer[0].replace("fediverse:", ""),
          ...fediServer[1],
        };
      });

    logging.info("mb", piefedFedServersDateFiltered.length);

    return piefedFedServersDateFiltered;
  }

  async crawlInstanceData(crawlDomain: string) {
    const nodeInfo = await this.getNodeInfo(crawlDomain);

    console.log(`${this.logPrefix} [${crawlDomain}] nodeInfo`, nodeInfo);

    if (!nodeInfo.software) {
      throw new CrawlError("no software key found for " + crawlDomain);
    }

    // store all fediverse instance software for easy metrics
    await storage.fediverse.upsert(crawlDomain, nodeInfo.software);

    // only allow piefed instances
    if (nodeInfo.software.name != "piefed") {
      throw new CrawlError(`not a piefed instance (${nodeInfo.software.name})`);
    }

    const [siteInfo, siteHeaders] = await this.getSiteInfo(crawlDomain);
    console.log(`${crawlDomain}: found piefed instance`, siteHeaders, siteInfo);

    const actorBaseUrl = getActorBaseUrl(siteInfo.site_view.site.actor_id);
    if (!actorBaseUrl) {
      console.error(`${crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`);
      throw new CrawlError(`${crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`);
    }

    if (actorBaseUrl !== crawlDomain) {
      console.error(
        `${crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`,
      );
      throw new CrawlError(
        `${crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`,
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
    const siteInfo = await this.client.getUrlWithRetry("https://" + crawlDomain + "/api/v3/site");

    return [siteInfo.data, siteInfo.headers];
  }

  async crawlFederatedInstances(crawlDomain: string) {
    const fedReq = await this.client.getUrlWithRetry("https://" + crawlDomain + "/api/alpha/federated_instances");

    const federatedInstances = fedReq.data.federated_instances.linked;

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

      if (instance.software === "piefed") {
        console.log(`${this.logPrefix} [${crawlDomain}] create job ${instance.domain}`);
        this.piefedQueue.createJob(instance.domain);
      }
    }

    return federatedInstances;
  }

  async crawlCommunitiesData(crawlDomain: string, pageNumber: number = 1): Promise<IIncomingPiefedCommunityData[]> {
    const communities = await this.getPageData(crawlDomain, pageNumber);

    logging.debug(`${this.logPrefix} Page ${pageNumber}, Results: ${communities.length}`);

    //  promises track the upsert of Community data
    let communitiesData: IIncomingPiefedCommunityData[] = communities;

    // if this page had non-zero results
    if (communities.length > 0) {
      // upsert the page's community's data
      let promises: Promise<any>[] = [];
      for (var communityData of communities) {
        promises.push(this.storePiefedCommunityData(crawlDomain, communityData));
      }
      await Promise.all(promises);

      // sleep between pages
      await new Promise((resolve) => setTimeout(resolve, TIME_BETWEEN_PAGES));

      const subPromises = await this.crawlCommunitiesData(crawlDomain, pageNumber + 1);
      if (subPromises.length > 0) {
        communitiesData.push(...subPromises);
      }
    }

    return communitiesData;
  }

  async getPageData(crawlDomain: string, pageNumber: number = 1): Promise<IIncomingPiefedCommunityData[]> {
    logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

    try {
      let communitiesList = await this.client.getUrlWithRetry(
        "https://" + crawlDomain + "/api/alpha/community/list",
        {
          params: {
            page: pageNumber,
            limit: 50,
            type_: "Local",
            show_nsfw: "true",
          },
          timeout: PAGE_TIMEOUT,
        },
        RETRY_PAGE_COUNT, // retry count per-page
      );

      const communities = communitiesList.data.communities;

      // must be an array
      if (!Array.isArray(communities)) {
        logging.error(`${this.logPrefix} Community list not an array:`, communitiesList.data.substr(0, 15));
        throw new CrawlError(`Community list not an array: ${communities}`);
      }

      return communities;
    } catch (e) {
      // TODO - possibly adjust this to check for next_page being None in the response?
      // mbin will return a 404 at the end of results
      if (e.response?.status === 404 && pageNumber > 1) {
        return [];
      }

      // throw new CrawlError("Failed to get community page");
      throw new CrawlError(e.message, e);
    }
  }

  // validate the community is for the domain being scanned, and save it
  async storePiefedCommunityData(crawlDomain: string, communityData: IIncomingPiefedCommunityData) {
    const outCommunityData: IPiefedCommunityData = {
      baseurl: crawlDomain,
      ...communityData,

      lastCrawled: Date.now(),
    };

    // logging.debug(`${this.logPrefix} cralDomain ${crawlDomain}, outCommunityData: ${outCommunityData.community.actor_id}`);
    
    await storage.piefed.upsert(crawlDomain, outCommunityData);

    await storage.piefed.setTrackedAttribute(
      crawlDomain,
      communityData.community.name,
      "subscriptionsCount",
      communityData.counts.subscriptions_count,
    );

    await storage.piefed.setTrackedAttribute(
      crawlDomain,
      communityData.community.name,
      "postCount",
      communityData.counts.post_count,
    );

    await storage.piefed.setTrackedAttribute(
      crawlDomain,
      communityData.community.name,
      "postCommentCount",
      communityData.counts.post_reply_count,
    );

    return true;
  }
}

export const piefedInstanceProcessor: IJobProcessor = async ({ baseUrl }) => {
  const startTime = Date.now();

  try {
    // check for recent scan of this piefed instance
    const lastCrawl = await storage.tracking.getLastCrawl("piefed", baseUrl);
    if (lastCrawl) {
      const lastCrawledMsAgo = Date.now() - lastCrawl.time;
      throw new CrawlTooRecentError(`Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`);
    }

    // check for recent error
    const lastError = await storage.tracking.getOneError("piefed", baseUrl);
    if (lastError?.time) {
      const lastErrorTime = lastError.time;
      const now = Date.now();

      throw new CrawlTooRecentError(`Skipping - Error too recently (${(now - lastErrorTime) / 1000}s ago)`);
    }

    const crawler = new CrawlPiefed();

    const instanceData = await crawler.crawlInstanceData(baseUrl);

    await crawler.crawlFederatedInstances(baseUrl);

    const communitiesData = await crawler.crawlCommunitiesData(baseUrl);

    console.log("communitiesData", communitiesData.length);

    await storage.tracking.setLastCrawl("piefed", `${baseUrl}`, instanceData);

    await storage.tracking.setLastCrawl("piefed", baseUrl, {
      duration: (Date.now() - startTime) / 1000,
    });

    return communitiesData;
  } catch (error) {
    if (error instanceof CrawlTooRecentError) {
      logging.warn(`[PiefedQueue] [${baseUrl}] CrawlTooRecentError: ${error.message}`);
      return true;
    }

    const errorDetail = {
      error: error.message,
      // stack: error.stack,
      isAxiosError: error.isAxiosError,
      requestUrl: error.isAxiosError ? error.request.url : null,
      time: Date.now(),
    };

    await storage.tracking.upsertError("piefed", baseUrl, errorDetail);

    logging.error(`[PiefedQueue] [${baseUrl}] Error: ${error.message}`, error);
  }

  return false;
};
