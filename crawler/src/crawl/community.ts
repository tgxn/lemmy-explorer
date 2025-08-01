import logging from "../lib/logging";

import type { ICommunityData } from "../../../types/storage";
import type { IJobProcessor } from "../queue/BaseQueue";

import { CrawlError, CrawlTooRecentError } from "../lib/error";
import { sleepThreadMs } from "../lib/const";

import storage from "../lib/crawlStorage";
import CrawlClient from "../lib/CrawlClient";

const TIME_BETWEEN_PAGES = 2500;
const RETRY_PAGE_COUNT = 3;
const PAGE_TIMEOUT = 10000;

/**
 * Each instance is a unique baseURL
 */
export default class CommunityCrawler {
  private crawlDomain: string;
  private logPrefix: string;

  private client: CrawlClient;

  constructor(crawlDomain: string) {
    this.crawlDomain = crawlDomain;
    this.logPrefix = `[CommunityList] [${this.crawlDomain}]`;

    this.client = new CrawlClient();
  }

  // the actor id for the community should match the domain https://lemmy.fmhy.ml/c/freemediaheckyeah
  private splitCommunityActorParts(actorId: string): { basePart: string; communityPart: string } {
    const splitActorId = actorId.split("/");
    const basePart = splitActorId[2];
    const communityPart = splitActorId[4];

    return { basePart, communityPart };
  }

  // validate the community is for the domain being scanned, and save it
  async storeCommunityData(community: ICommunityData): Promise<ICommunityData | false> {
    // check make sure it's a string or throw an error
    if (!community.community.actor_id || typeof community.community.actor_id !== "string") {
      throw new Error(
        `${this.logPrefix} storeCommunityData: actorId is not a string: ${community.community.actor_id}`,
      );
    }

    const { basePart, communityPart } = this.splitCommunityActorParts(community.community.actor_id);

    // validate the community actor_id matches the domain
    if (basePart != this.crawlDomain || communityPart != community.community.name) {
      logging.error(
        `${this.logPrefix} Community actor_id does not match domain: ${JSON.stringify(community.community)}`,
      );
      return false;
    }

    await storage.community.setTrackedAttribute(
      this.crawlDomain,
      communityPart,
      "subscribers",
      community.counts.subscribers.toString(),
    );

    if (community.counts.posts) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "posts",
        community.counts.posts.toString(),
      );
    }

    if (community.counts.comments) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "comments",
        community.counts.comments.toString(),
      );
    }

    if (community.counts.users_active_day) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_day",
        community.counts.users_active_day.toString(),
      );
    }

    if (community.counts.users_active_week) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_week",
        community.counts.users_active_week.toString(),
      );
    }

    if (community.counts.users_active_month) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_month",
        community.counts.users_active_month.toString(),
      );
    }

    await storage.community.upsert(this.crawlDomain, community);

    return community;
  }

  // * crawlSingle(communityName) - Crawls over `/api/v3/community` with a given community name and stores the results in redis.
  async crawlSingle(communityName: string): Promise<ICommunityData | null> {
    try {
      logging.debug(`${this.logPrefix} crawlSingle Starting Crawl: ${communityName}`);

      const communityData = await this.getSingleCommunityData(communityName);

      logging.info(`${this.logPrefix} crawlSingle Ended Success: ${communityName}`, communityData);

      return communityData;
    } catch (error) {
      logging.error(`${this.logPrefix} crawlSingle ERROR Community: ${communityName}`, error.message);
    }

    return null;
  }

  async getSingleCommunityData(communityName: string): Promise<any> {
    try {
      const communityData = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community",
        {
          params: {
            name: communityName,
          },
        },
        1,
      );

      if (communityData.data.community_view) {
        logging.debug(`${this.logPrefix} Storing`, communityData.data.community_view.community.name);

        await this.storeCommunityData(communityData.data.community_view);

        return communityData.data.community_view;
      }

      logging.error(
        `${this.logPrefix} getSingleCommunityData no community_view, deleting!`,
        communityData.data.slice(0, 100),
      );
      await storage.community.delete(this.crawlDomain, communityName, "no community_view");

      return null;
    } catch (e) {
      logging.error(`${this.logPrefix} getSingleCommunityData error: `, e.message, e.code);

      // delete the community if it's no longer found
      if (e.response?.data?.error && e.response.data.error == "couldnt_find_community") {
        logging.info(
          `${this.logPrefix} couldnt_find_community, deleting community community:${this.crawlDomain}:${communityName}`,
        );

        await storage.community.delete(this.crawlDomain, communityName, e.response.data.error);

        return null;
      }

      // data contains `Argo Tunnel error`
      if (
        e.response?.data &&
        typeof e.response.data === "string" &&
        e.response.data.includes("Argo Tunnel error")
      ) {
        logging.error(
          `${this.logPrefix} Argo Tunnel error, deleting community community:${this.crawlDomain}:${communityName}`,
        );

        await storage.community.delete(this.crawlDomain, communityName, "Argo Tunnel error");

        return null;
      }

      // e.code
      if (e.isAxiosError && e.code) {
        logging.error(
          `${this.logPrefix} ${e.code} error, deleting community community:${this.crawlDomain}:${communityName}`,
        );

        await storage.community.delete(this.crawlDomain, communityName, e.code);

        return null;
      }

      // api returned <!DOCTYPE html>
      if (e.response?.data && e.response.data.toLowerCase().includes("<!doctype html>")) {
        logging.error(
          `${this.logPrefix} <!DOCTYPE html> error, deleting community community:${this.crawlDomain}:${communityName}`,
        );

        await storage.community.delete(this.crawlDomain, communityName, "<!DOCTYPE html>");

        return null;
      }

      // other unknown error!
      logging.error(`${this.logPrefix} communityData unknown error`, e.message, e);
      throw e;
    }
  }

  // * crawlList() - Crawls over `/api/v3/communities` and stores the results in redis.
  async crawlList() {
    try {
      logging.info(`${this.logPrefix} Starting Crawl List`);

      const promisesArray = await this.crawlCommunityPaginatedList();
      const resultPromises = await Promise.all(promisesArray);

      // get a deduped count of total communitied by name
      const communityNames = new Set<string>();
      for (const promise of resultPromises) {
        if (promise && promise.community && promise.community.name) {
          communityNames.add(promise.community.name);
        }
      }

      // get the expected count from the siteData
      const instanceRecord = await storage.instance.getOne(this.crawlDomain);
      let expectedCount: number | undefined = undefined;

      if (instanceRecord && instanceRecord.siteData && instanceRecord.siteData.counts.communities) {
        expectedCount = instanceRecord.siteData.counts.communities;
      }

      // log error on mismatch
      if (expectedCount && expectedCount !== communityNames.size) {
        logging.error(
          `!!!! ${this.logPrefix} Expected community count (${expectedCount}) does not match actual (${communityNames.size})`,
        );
      }

      logging.info(
        `${this.logPrefix} Ended Success (${resultPromises.length} results) unique: ${communityNames.size} expected: ${expectedCount}`,
      );

      return resultPromises;
    } catch (e) {
      logging.error(`${this.logPrefix} Crawl List Failed: `, e.message);
      throw new CrawlError(e.message, e);
    }
  }

  async crawlCommunityPaginatedList(pageNumber: number = 1): Promise<ICommunityData[]> {
    const communities: ICommunityData[] = await this.getPageData(pageNumber);

    logging.debug(`${this.logPrefix} Page ${pageNumber}, Results: ${communities.length}`);

    let results = communities;

    //  promises track the upsert of community data
    let promises: Promise<any>[] = [];
    for (var community of communities) {
      promises.push(this.storeCommunityData(community));
    }
    await Promise.all(promises);

    // if this page had non-zero results
    if (communities.length > 0) {
      // sleep between pages
      logging.debug(`${this.logPrefix} Sleeping for ${TIME_BETWEEN_PAGES}ms between pages`);
      await sleepThreadMs(TIME_BETWEEN_PAGES);
      logging.debug(`${this.logPrefix} Page ${pageNumber}, Crawling next page...`);

      const subResults = await this.crawlCommunityPaginatedList(pageNumber + 1);
      if (subResults.length > 0) {
        results.push(...subResults);
      }
    }

    return results;
  }

  async getPageData(pageNumber: number = 1): Promise<ICommunityData[]> {
    logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

    try {
      const communityList = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community/list",
        {
          params: {
            type_: "Local", // Local communities only
            sort: "Old", // Oldest communities first to maintain ordering
            limit: 50, // Limit to 50 communities per page - Lemmy's maximum
            show_nsfw: true, // Show NSFW communities
            page: pageNumber, // Page number to fetch
          },
          timeout: PAGE_TIMEOUT,
        },
        RETRY_PAGE_COUNT,
      );

      const communities = communityList.data.communities;

      // must be an array
      if (!Array.isArray(communities)) {
        logging.error(`${this.logPrefix} Community list not an array:`, communityList.data.substr(0, 15));
        throw new CrawlError(`Community list not an array: ${communities}`);
      }

      return communities;
    } catch (e) {
      // throw new CrawlError("Failed to get community page");
      throw new CrawlError(e.message, e);
    }
  }
}

export const communityListProcessor: IJobProcessor<ICommunityData[]> = async ({ baseUrl }) => {
  const startTime = Date.now();

  if (!baseUrl) {
    logging.error(`[Community] [${baseUrl}] Missing baseUrl`);
    throw new CrawlError("Missing baseUrl");
  }

  try {
    // check if community's instance has already been crawled revcently (these expire from redis)
    const lastCrawl = await storage.tracking.getLastCrawl("community", baseUrl);
    if (lastCrawl) {
      const lastCrawledMsAgo = Date.now() - lastCrawl.time;
      throw new CrawlTooRecentError(
        `Skipping - Crawled too recently [${logging.formatDuration(lastCrawledMsAgo)}]`,
      );
    }

    // check when the latest entry to errors was too recent
    const lastErrorTs = await storage.tracking.getOneError("community", baseUrl);
    if (lastErrorTs) {
      const lastErrorMsAgo = Date.now() - lastErrorTs.time;
      throw new CrawlTooRecentError(
        `Skipping - Error too recently [${logging.formatDuration(lastErrorMsAgo)}]`,
      );
    }

    // perform the crawl
    const crawler = new CommunityCrawler(baseUrl);
    const communityData = await crawler.crawlList();

    // set last successful crawl
    await storage.tracking.setLastCrawl("community", baseUrl, {
      duration: (Date.now() - startTime) / 1000,
      resultCount: communityData.length,
    });

    const endTime = Date.now();
    logging.info(
      `[Community] [${baseUrl}] Finished in [${logging.formatDuration(endTime - startTime)}], ${communityData.length} communities found`,
    );

    return communityData;
  } catch (error) {
    if (error instanceof CrawlTooRecentError) {
      logging.warn(`[Community] [${baseUrl}] CrawlTooRecentError: ${error.message}`);
    } else {
      const errorDetail = {
        error: error.message,
        stack: error.stack,
        isAxiosError: error.isAxiosError,
        requestUrl: error.isAxiosError ? error.request.url : null,
        time: Date.now(),
        duration: Date.now() - startTime,
      };

      logging.error(`[Community] [${baseUrl}] Error: ${error.message}`);

      // if (error instanceof CrawlError || error instanceof AxiosError) {
      await storage.tracking.upsertError("community", baseUrl, errorDetail);
    }
  }

  return null;
};

export const singleCommunityProcessor: IJobProcessor<ICommunityData | null> = async ({
  baseUrl,
  community,
}) => {
  if (!baseUrl || !community) {
    logging.error(`[OneCommunity] [${baseUrl}] Missing baseUrl or community`);
    throw new CrawlError("Missing baseUrl or community");
  }

  try {
    const crawler = new CommunityCrawler(baseUrl);

    const communityData = await crawler.crawlSingle(community);

    return communityData;
  } catch (error) {
    if (error instanceof CrawlTooRecentError) {
      logging.warn(`[OneCommunity] [${baseUrl}] CrawlTooRecentError: ${error.message}`);
    } else {
      const errorDetail = {
        error: error.message,
        stack: error.stack,
        isAxiosError: error.isAxiosError,
        requestUrl: error.isAxiosError ? error.request.url : null,
        time: Date.now(),
      };

      // if (error instanceof CrawlError || error instanceof AxiosError) {
      await storage.tracking.upsertError("one_community", baseUrl, errorDetail);

      logging.error(`[OneCommunity] [${baseUrl}] Error: ${error.message}`);
    }
  }

  return null;
};
