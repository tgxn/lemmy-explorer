import logging from "../lib/logging";
import crawlStorage from "../lib/crawlStorage";

import { CRAWL_AGED_TIME } from "../lib/const";
import { HTTPError, CrawlError, CrawlTooRecentError } from "../lib/error";
import { isValidLemmyDomain } from "../lib/validator";

import { getActorBaseUrl } from "../lib/validator";

import { IJobProcessor } from "../queue/BaseQueue";
import CommunityListQueue from "../queue/community_list";
import InstanceQueue from "../queue/instance";

import CrawlClient from "../lib/CrawlClient";

import KBinQueue from "../queue/kbin";

export default class InstanceCrawler {
  private crawlDomain: string;
  private logPrefix: string;

  private kbinQueue: KBinQueue;

  private client: CrawlClient;

  constructor(crawlDomain: string) {
    this.crawlDomain = crawlDomain;
    this.logPrefix = `[Instance] [${this.crawlDomain}]`;

    this.kbinQueue = new KBinQueue(false);

    this.client = new CrawlClient();
  }

  // fully process the instance crawl, called from bequeue and errors are handled above this
  async crawl() {
    const instanceData = await this.crawlInstance();

    if (instanceData) {
      // store/update the instance
      await crawlStorage.instance.upsert(this.crawlDomain, {
        ...instanceData,
        lastCrawled: Date.now(),
      });

      logging.info(
        `${this.logPrefix} Completed OK (Found "${instanceData?.siteData?.site?.name}")`
      );

      return instanceData;
    }

    throw new CrawlError("No instance data returned");
  }

  async getNodeInfo() {
    const wellKnownUrl =
      "https://" + this.crawlDomain + "/.well-known/nodeinfo";
    const wellKnownInfo = await this.client.getUrlWithRetry(
      wellKnownUrl,
      {
        timeout: 10000, // smaller for nodeinfo
      },
      2
    );

    let nodeinfoUrl;
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

  async getSiteInfo() {
    const siteInfo = await this.client.getUrlWithRetry(
      "https://" + this.crawlDomain + "/api/v3/site"
    );

    return [siteInfo.data, siteInfo.headers];
  }

  /**
   * Crawls Linked Lemmy Instance Stats
   *
   * Based on code from stats crawler.
   * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
   */
  async crawlInstance() {
    const nodeInfo = await this.getNodeInfo();
    if (!nodeInfo.software) {
      throw new CrawlError("no software key found for " + this.crawlDomain);
    }

    // store all fediverse instance software for easy metrics
    await crawlStorage.fediverse.upsert(this.crawlDomain, nodeInfo.software);

    // scan kbin instances that are found
    if (nodeInfo.software.name == "kbin") {
      console.log(`${this.crawlDomain}: found kbin instance  - creating job`);
      await this.kbinQueue.createJob(this.crawlDomain);
    }

    // only allow lemmy instances
    if (
      nodeInfo.software.name != "lemmy" &&
      nodeInfo.software.name != "lemmybb"
    ) {
      throw new CrawlError(`not a lemmy instance (${nodeInfo.software.name})`);
    }

    const [siteInfo, siteHeaders] = await this.getSiteInfo();
    console.log(`${this.crawlDomain}: found lemmy instance`, siteHeaders);

    const actorBaseUrl = getActorBaseUrl(siteInfo.site_view.site.actor_id);
    if (!actorBaseUrl) {
      console.error(
        `${this.crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`
      );
      throw new CrawlError(
        `${this.crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`
      );
    }

    if (actorBaseUrl !== this.crawlDomain) {
      console.error(
        `${this.crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`
      );
      throw new CrawlError(
        `${this.crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`
      );
    }

    /**
     * map all languages to array of their codes
     */

    function mapLangsToCodes(allLangsArray, discussionIdsArray) {
      const discussionLangs: string[] = [];

      if (!allLangsArray) return [];
      if (!discussionIdsArray) return [];

      /// if all are selected, set flag
      let allSelected = false;
      if (allLangsArray.length === discussionIdsArray.length) {
        allSelected = true;
      }
      if (!allSelected) {
        discussionIdsArray.forEach((id: string) => {
          const languageData = allLangsArray.find((lang) => lang.id === id);
          discussionLangs.push(languageData.code);
        });
      } else {
        discussionLangs.push("all");
      }

      return discussionLangs;
    }

    const discussionLangs = mapLangsToCodes(
      siteInfo.all_languages,
      siteInfo.discussion_languages
    );

    //   logging.info(siteInfo);
    const instanceData = {
      nodeData: {
        software: nodeInfo.software,
        usage: nodeInfo.usage,
        openRegistrations: nodeInfo.openRegistrations,
      },
      siteData: {
        site: siteInfo.site_view.site,
        config: siteInfo.site_view.local_site,
        counts: siteInfo.site_view.counts,
        admins: siteInfo.admins,
        version: siteInfo.version,
        taglines: siteInfo.taglines,
        federated: siteInfo.federated_instances,
      },
      headers: siteHeaders,
      langs: discussionLangs,
    };

    try {
      // store versioned attributes
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "version",
        siteInfo.version
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "users",
        siteInfo.site_view.counts.users
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "posts",
        siteInfo.site_view.counts.posts
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "comments",
        siteInfo.site_view.counts.comments
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "communities",
        siteInfo.site_view.counts.communities
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "users_active_day",
        siteInfo.site_view.counts.users_active_day
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "users_active_week",
        siteInfo.site_view.counts.users_active_week
      );
      await crawlStorage.instance.setTrackedAttribute(
        this.crawlDomain,
        "users_active_month",
        siteInfo.site_view.counts.users_active_month
      );
    } catch (e) {
      console.error(e);
    }

    return instanceData;
  }
}

// start a job for each instances in the federation lists
const crawlFederatedInstanceJobs = async (federatedData) => {
  const linked = federatedData.linked || [];
  const allowed = federatedData.allowed || [];
  const blocked = federatedData.blocked || [];

  // pull data from all federated instances
  let instancesDeDup = [...new Set([...linked, ...allowed, ...blocked])];

  const instanceQueue = new InstanceQueue();

  for (var instance of instancesDeDup) {
    if (isValidLemmyDomain(instance)) {
      await instanceQueue.createJob(instance);
    }
  }

  return instancesDeDup;
};

// returns a amount os ms since we last crawled it, false if all good
// async getLastCrawlMsAgo(instanceBaseUrl: string) {
//   const existingInstance = await crawlStorage.instance.getOne(
//     instanceBaseUrl
//   );

//   if (existingInstance?.lastCrawled) {
//     // logging.info("lastCrawled", existingInstance.lastCrawled);

//     const lastCrawl = existingInstance.lastCrawled;
//     const now = Date.now();

//     return now - lastCrawl;
//   }

//   // check for recent error
//   const lastError = await crawlStorage.tracking.getOneError(
//     "instance",
//     instanceBaseUrl
//   );
//   if (lastError?.time) {
//     // logging.info("lastError", lastError.time);

//     const lastErrorTime = lastError.time;
//     const now = Date.now();

//     return now - lastErrorTime;
//   }

//   return false;
// }

/*
    main processing loop - should catch all errors

    jobs can fail with three results:
    - Other Error: something is wrong with the job, but it should be retried later
    - CrawlError: something is wrong with the job (bad url, invalid json)
      - removed from the queue (caught by the failed event)
      - added to the failures table
      - not re-tried till failues cron runs after 6 hours, added to perm_fail if failed  again

    - CrawlTooRecentError: the job was skipped because it's too recent
      - doesnt cause error or success timers to reset

    - Success: job completed successfully
      - removed from the queue
      - added to the successes table
      - re-tried every 6 hours
    */
export const instanceProcessor: IJobProcessor = async ({ baseUrl }) => {
  const startTime = Date.now();

  try {
    // if it's not a string
    if (typeof baseUrl !== "string") {
      logging.error("baseUrl is not a string", baseUrl);
      throw new CrawlError("baseUrl is not a string");
    }

    // try to clean up the url
    let instanceBaseUrl = baseUrl.toLowerCase();
    instanceBaseUrl = instanceBaseUrl.replace(/\s/g, ""); // remove spaces
    instanceBaseUrl = instanceBaseUrl.replace(/.*@/, ""); // remove anything before an @ if present
    instanceBaseUrl = instanceBaseUrl.trim();

    // if it's not a valid, put it in errors so it doesn't get hit again
    if (!isValidLemmyDomain(instanceBaseUrl)) {
      logging.error("baseUrl is not a valid lemmy domain", instanceBaseUrl);
      throw new CrawlError("baseUrl is not a valid domain");
    }

    logging.debug(`[Instance] [${baseUrl}] Starting Crawl`);

    // check if it's known to not be running lemmy (recan it if it's been a while)
    const knownFediverseServer = await crawlStorage.fediverse.getOne(
      instanceBaseUrl
    );
    if (knownFediverseServer) {
      if (
        knownFediverseServer.name !== "lemmy" &&
        knownFediverseServer.name !== "lemmybb" &&
        knownFediverseServer.name !== "kbin" &&
        knownFediverseServer.time &&
        Date.now() - knownFediverseServer.time < CRAWL_AGED_TIME.FEDIVERSE // re-scan fedi servers to check their status
      ) {
        throw new CrawlTooRecentError(
          `Skipping - Too recent known non-lemmy server "${knownFediverseServer.name}"`
        );
      }
    }

    //  last crawl if it's been successfully too recently
    const lastCrawl = await crawlStorage.tracking.getLastCrawl(
      "instance",
      instanceBaseUrl
    );
    if (lastCrawl) {
      const lastCrawledMsAgo = Date.now() - lastCrawl.time;
      throw new CrawlTooRecentError(
        `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
      );
    }

    // check when the latest entry to errors was too recent
    const lastErrorTs = await crawlStorage.tracking.getOneError(
      "instance",
      instanceBaseUrl
    );
    if (lastErrorTs) {
      const lastErrorMsAgo = Date.now() - lastErrorTs.time;
      throw new CrawlTooRecentError(
        `Skipping - Error too recently (${lastErrorMsAgo / 1000}s ago)`
      );
    }

    const crawler = new InstanceCrawler(instanceBaseUrl);
    const instanceData = await crawler.crawl();

    // start crawl jobs for federated instances
    if (instanceData.siteData?.federated?.linked.length > 0) {
      const countFederated = await crawlFederatedInstanceJobs(
        instanceData.siteData.federated
      );

      logging.info(
        `[Instance] [${baseUrl}] Created ${countFederated.length} federated instance jobs`
      );
    }

    // create job to scan the instance for communities once a crawl succeeds
    logging.info(
      `[Instance] [${baseUrl}] Creating community crawl job for ${instanceBaseUrl}`
    );
    const crawlCommunity = new CommunityListQueue();
    await crawlCommunity.createJob(instanceBaseUrl);

    // set last successful crawl
    await crawlStorage.tracking.setLastCrawl("instance", baseUrl, {
      duration: (Date.now() - startTime) / 1000,
    });

    const endTime = Date.now();
    logging.info(
      `[Instance] [${baseUrl}] Finished in ${(endTime - startTime) / 1000}s`
    );

    return instanceData;
  } catch (error) {
    if (error instanceof CrawlTooRecentError) {
      logging.warn(
        `[Instance] [${baseUrl}] CrawlTooRecentError: ${error.message}`
      );
    } else if (error instanceof HTTPError) {
      const errorDetail = {
        error: error.message,
        stack: error.stack,
        isAxiosError: error.isAxiosError,
        code: error.code,
        url: error.url,
        time: new Date().getTime(),
        duration: Date.now() - startTime,
      };

      logging.error(`[Instance] [${baseUrl}] CrawlError: ${error.message}`);

      await crawlStorage.tracking.upsertError("instance", baseUrl, errorDetail);
    } else {
      // console.log("error", error);

      const errorDetail = {
        error: error.message,
        stack: error.stack,
        isAxiosError: error.isAxiosError,
        code: error.code,
        url: error.url,
        time: new Date().getTime(),
        duration: Date.now() - startTime,
      };

      // console.log("errorDetail", errorDetail);

      logging.error(`[Instance] [${baseUrl}] Error: ${error.message}`);

      await crawlStorage.tracking.upsertError("instance", baseUrl, errorDetail);
    }
  }

  return null;
};
