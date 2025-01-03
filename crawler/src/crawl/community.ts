import logging from "../lib/logging";

import { CrawlError } from "../lib/error";

import { CrawlTooRecentError } from "../lib/error";

import { IJobProcessor } from "../queue/BaseQueue";

import storage from "../lib/crawlStorage";

import CrawlClient from "../lib/CrawlClient";

const TIME_BETWEEN_PAGES = 2000;

const RETRY_COUNT = 2;
const RETRY_PAGE_COUNT = 2;
const TIME_BETWEEN_RETRIES = 1000;

const PAGE_TIMEOUT = 5000;

/**
 * crawlList() - Crawls over `/api/v3/communities` and stores the results in redis.
 * crawlSingle(communityName) - Crawls over `/api/v3/community` with a given community name and stores the results in redis.
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
  splitCommunityActorParts(actorId: string) {
    const splitActorId = actorId.split("/");
    const basePart = splitActorId[2];
    const communityPart = splitActorId[4];

    return { basePart, communityPart };
  }

  // validate the community is for the domain being scanned, and save it
  async storeCommunityData(community) {
    const { basePart, communityPart } = this.splitCommunityActorParts(community.community.actor_id);

    // validate the community actor_id matches the domain
    if (basePart != this.crawlDomain || communityPart != community.community.name) {
      logging.error(
        `${this.logPrefix} Community actor_id does not match domain: ${community.community.actor_id} ${community.community.name}`,
      );
      return false;
    }

    await storage.community.setTrackedAttribute(
      this.crawlDomain,
      communityPart,
      "subscribers",
      community.counts.subscribers,
    );

    if (community.counts.hot_rank) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "hot_rank",
        community.counts.hot_rank,
      );
    }

    if (community.counts.posts) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "posts",
        community.counts.posts,
      );
    }

    if (community.counts.comments) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "comments",
        community.counts.comments,
      );
    }

    if (community.counts.users_active_day) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_day",
        community.counts.users_active_day,
      );
    }

    if (community.counts.users_active_week) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_week",
        community.counts.users_active_week,
      );
    }

    if (community.counts.users_active_month) {
      await storage.community.setTrackedAttribute(
        this.crawlDomain,
        communityPart,
        "users_active_month",
        community.counts.users_active_month,
      );
    }

    await storage.community.upsert(this.crawlDomain, community);

    return true;
  }

  async crawlSingle(communityName: string) {
    try {
      logging.debug(`${this.logPrefix} Starting Crawl: ${communityName}`);

      await this.getSingleCommunityData(communityName);

      logging.info(`${this.logPrefix} Ended Success: ${communityName}`);
    } catch (error) {
      logging.trace(`${this.logPrefix} ERROR Community: ${communityName}`, error.message);
    }
  }

  async getSingleCommunityData(communityName: string, attempt: number = 0) {
    try {
      const communityData = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community",
        {
          params: {
            name: communityName,
          },
        },
        0,
      );

      if (communityData.data.community_view) {
        console.log(`${this.logPrefix} Storing`, communityData.data.community_view.community.name);

        await this.storeCommunityData(communityData.data.community_view);

        return communityData.data.community_view;
      }
    } catch (e) {
      // dont retry if the community doesnt exist
      if (e.data && e.data.error == "couldnt_find_community") {
        logging.warn("DELETE community error", e.data.error);

        await storage.community.delete(this.crawlDomain, communityName, e.data.error);
        return;
      } else if (e.data) {
        logging.warn("OTHER community error");

        // only delete unless explicit
        // await storage.community.delete(
        //   this.crawlDomain,
        //   communityName,
        //   e.data.error
        // );
        return;
      }

      // re-try overall
      if (attempt < RETRY_COUNT) {
        await new Promise((resolve) => setTimeout(resolve, TIME_BETWEEN_RETRIES));
        return await this.getSingleCommunityData(communityName, attempt + 1);
      }

      logging.error(`${this.logPrefix} communityData error`, e.type, e.message);
      // return false;

      throw e;
    }
  }

  async crawlList() {
    try {
      logging.info(`${this.logPrefix} Starting Crawl List`);

      const promisesArray = await this.crawlCommunityPaginatedList();
      const resultPromises = await Promise.all(promisesArray);

      logging.info(`${this.logPrefix} Ended Success (${resultPromises.length} results)`);

      return resultPromises;
    } catch (e) {
      logging.error(`${this.logPrefix} Crawl List Failed: `, e.message);
      throw new CrawlError(e.message, e);
      // throw e;
    }
  }

  async crawlCommunityPaginatedList(pageNumber: number = 1) {
    const communities = await this.getPageData(pageNumber);

    logging.debug(`${this.logPrefix} Page ${pageNumber}, Results: ${communities.length}`);

    //  promises track the upsert of community data
    let promises: Promise<any>[] = [];

    for (var community of communities) {
      promises.push(this.storeCommunityData(community));
    }

    // if this page had non-zero results
    if (communities.length > 0) {
      // sleep between pages
      await new Promise((resolve) => setTimeout(resolve, TIME_BETWEEN_PAGES));

      const subPromises = await this.crawlCommunityPaginatedList(pageNumber + 1);
      if (subPromises.length > 0) {
        promises.push(...subPromises);
      }
    }

    return promises;
  }

  async getPageData(pageNumber: number = 1) {
    logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

    let communityList;
    try {
      communityList = await this.client.getUrlWithRetry(
        "https://" + this.crawlDomain + "/api/v3/community/list",
        {
          params: {
            type_: "Local",
            limit: 50,
            page: pageNumber,
            show_nsfw: true, // Added in 0.18.x? ish...
          },
          timeout: PAGE_TIMEOUT,
        },
        RETRY_PAGE_COUNT, // retry count per-page
      );
    } catch (e) {
      // throw new CrawlError("Failed to get community page");
      throw new CrawlError(e.message, e);
    }

    const communities = communityList.data.communities;

    // must be an array
    if (!Array.isArray(communities)) {
      logging.error(`${this.logPrefix} Community list not an array:`, communityList.data.substr(0, 15));
      throw new CrawlError(`Community list not an array: ${communities}`);
    }

    return communities;
  }
}

export const communityListProcessor: IJobProcessor = async ({ baseUrl }) => {
  const startTime = Date.now();

  try {
    // check if community's instance has already been crawled revcently (these expire from redis)
    const lastCrawl = await storage.tracking.getLastCrawl("community", baseUrl);
    if (lastCrawl) {
      const lastCrawledMsAgo = Date.now() - lastCrawl.time;
      throw new CrawlTooRecentError(`Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`);
    }

    // check when the latest entry to errors was too recent
    const lastErrorTs = await storage.tracking.getOneError("community", baseUrl);
    if (lastErrorTs) {
      const lastErrorMsAgo = Date.now() - lastErrorTs.time;
      throw new CrawlTooRecentError(`Skipping - Error too recently (${lastErrorMsAgo / 1000}s ago)`);
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
    logging.info(`[Community] [${baseUrl}] Finished in ${(endTime - startTime) / 1000}s`);

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

export const singleCommunityProcessor: IJobProcessor = async ({ baseUrl, community }) => {
  let communityData: any = null;

  if (!baseUrl || !community) {
    logging.error(`[OneCommunity] [${baseUrl}] Missing baseUrl or community`);
    return null;
  }

  try {
    const crawler = new CommunityCrawler(baseUrl);

    communityData = await crawler.crawlSingle(community);
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

  return communityData;
};
