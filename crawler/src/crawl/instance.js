import Queue from "bee-queue";
import axios, { AxiosError } from "axios";

import {
  putInstanceData,
  storeFediverseInstance,
  storeError,
  getError,
  getInstanceData,
  getFediverseData,
  listInstanceData,
} from "../lib/storage.js";

import CrawlCommunity from "./communities.js";

import {
  CRAWL_TIMEOUT,
  CRAWL_RETRY,
  MIN_RECRAWL_MS,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
  AXIOS_REQUEST_TIMEOUT,
} from "../lib/const.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";

export default class CrawlInstance {
  constructor(isWorker) {
    this.queue = new Queue("instance", {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      console.error(`Job ${job.id} failed with error ${err.message}`);
    });

    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });

    this.crawlCommunity = new CrawlCommunity();

    if (isWorker) this.process();
  }

  createJob(instanceBaseUrl) {
    const trimmedUrl = instanceBaseUrl.trim();
    const job = this.queue.createJob({ baseUrl: trimmedUrl });
    job
      .timeout(CRAWL_TIMEOUT.INSTANCE)
      .retries(CRAWL_RETRY.INSTANCE)
      .setId(trimmedUrl) // deduplicate
      .save();
    // job.on("succeeded", (result) => {
    //   console.log(`Completed instanceQueue ${job.id}`, instanceBaseUrl);
    //   console.log();
    // });
  }

  // returns a amount os ms since we last crawled it, false if all good
  async getLastCrawlMsAgo(instanceBaseUrl) {
    const existingInstance = await getInstanceData(instanceBaseUrl);

    if (existingInstance?.lastCrawled) {
      // console.log("lastCrawled", existingInstance.lastCrawled);

      const lastCrawl = existingInstance.lastCrawled;
      const now = Date.now();

      return now - lastCrawl;
    }

    // check for recent error
    const lastError = await getError("instance", instanceBaseUrl);
    if (lastError?.time) {
      // console.log("lastError", lastError.time);

      const lastErrorTime = lastError.time;
      const now = Date.now();

      return now - lastErrorTime;
    }

    return false;
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        // if it's not a string
        if (typeof job.data.baseUrl !== "string") {
          console.error("baseUrl is not a string", job.data);
          throw new CrawlError("baseUrl is not a string");
        }
        console.debug(
          `[Instance] [${job.data.baseUrl}] [${job.id}] Starting Crawl`
        );

        let instanceBaseUrl = job.data.baseUrl.toLowerCase();
        instanceBaseUrl = instanceBaseUrl.replace(/\s/g, ""); // remove spaces
        instanceBaseUrl = instanceBaseUrl.replace(/.*@/, ""); // remove anything before an @ if present
        instanceBaseUrl = instanceBaseUrl.trim();

        // disallow * as a base url
        if (instanceBaseUrl === "*") {
          throw new CrawlError("cannot crawl `*`");
        }

        // check if it's known to not be running lemmy
        const knownFediverseServer = await getFediverseData(instanceBaseUrl);
        if (knownFediverseServer) {
          if (
            knownFediverseServer.name !== "lemmy" &&
            knownFediverseServer.name !== "lemmybb"
          ) {
            // console.debug("known non-lemmy server", knownFediverseServer);
            throw new CrawlWarning(
              `known non-lemmy server ${knownFediverseServer.name}`
            );
          }
        }

        // check if instance has already been crawled within CRAWL_EVERY
        const lastCrawledMsAgo = await this.getLastCrawlMsAgo(instanceBaseUrl);
        if (lastCrawledMsAgo && lastCrawledMsAgo < MIN_RECRAWL_MS) {
          throw new CrawlWarning(
            `Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
          );
        }

        const instanceData = await this.crawlInstance(instanceBaseUrl);

        if (instanceData) {
          // store/update the instance
          await putInstanceData(instanceBaseUrl, {
            ...instanceData,
            lastCrawled: Date.now(),
          });

          // create job to scan the instance for communities
          this.crawlCommunity.createJob(instanceBaseUrl);

          // attempt to crawl federated instances
          if (instanceData.siteData?.federated?.linked.length > 0) {
            const countFederated = this.crawlFederatedInstances(
              instanceData.siteData.federated
            );
            console.log(
              `[Instance] [${job.data.baseUrl}] [${job.id}] Crawled ${countFederated.length} federated instances`
            );
          }

          console.log(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Completed OK (Found "${instanceData?.siteData?.site?.name}")`
          );
          return instanceData;
        } else {
          throw new CrawlError("No instance data returned");
        }
      } catch (error) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          response: error.isAxiosError ? error.response : null,
          time: new Date().getTime(),
        };

        if (error instanceof CrawlError || error instanceof AxiosError) {
          await storeError("instance", job.data.baseUrl, errorDetail);

          console.error(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Error: ${error.message}`
          );
        } else if (error instanceof CrawlWarning) {
          console.error(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Warn: ${error.message}`
          );
        } else {
          console.error(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Error: ${error.message}`
          );
          console.trace(error);
        }
      }
      return true;
    });
  }

  /**
   * Crawls Linked Lemmy Instance Stats
   *
   * Based on code from stats crawler.
   * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
   */
  async crawlInstance(instanceBaseUrl) {
    const wellKnownUrl = "https://" + instanceBaseUrl + "/.well-known/nodeinfo";
    const wellKnownInfo = await this.axios.get(wellKnownUrl);

    let nodeinfoUrl;
    if (!wellKnownInfo.data.links) {
      throw new CrawlError("missing /.well-known/nodeinfo links");
    }

    for (var linkRel of wellKnownInfo.data.links) {
      if (linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0") {
        nodeinfoUrl = linkRel.href;
      }
    }
    if (!nodeinfoUrl) {
      throw new CrawlError("no diaspora rel in /.well-known/nodeinfo");
    }

    const nodeinfo2 = await this.axios.get(nodeinfoUrl);

    const software = nodeinfo2.data.software;

    // store all fediverse instance software for easy metrics
    await storeFediverseInstance(instanceBaseUrl, software);

    if (software.name != "lemmy" && software.name != "lemmybb") {
      throw new CrawlWarning(`not a lemmy instance (${software.name})`);
    }

    const siteInfo = await this.axios.get(
      "https://" + instanceBaseUrl + "/api/v3/site"
    );

    /**
     * map all languages to array of their codes
     */

    function mapLangsToCodes(allLangsArray, discussionIdsArray) {
      const discussionLangs = [];

      if (!allLangsArray) return [];
      if (!discussionIdsArray) return [];

      /// if all are selected, set flag
      let allSelected = false;
      if (allLangsArray.length === discussionIdsArray.length) {
        allSelected = true;
      }
      if (!allSelected) {
        discussionIdsArray.forEach((id) => {
          const languageData = allLangsArray.find((lang) => lang.id === id);
          discussionLangs.push(languageData.code);
        });
      } else {
        discussionLangs.push("all");
      }

      return discussionLangs;
    }

    const discussionLangs = mapLangsToCodes(
      siteInfo.data.all_languages,
      siteInfo.data.discussion_languages
    );

    //   console.log(siteInfo.data);
    const instanceData = {
      nodeData: {
        software: nodeinfo2.data.software,
        usage: nodeinfo2.data.usage,
        openRegistrations: nodeinfo2.data.openRegistrations,
      },
      siteData: {
        site: siteInfo.data.site_view.site,
        config: siteInfo.data.site_view.local_site,
        counts: siteInfo.data.site_view.counts,
        admins: siteInfo.data.admins,
        version: siteInfo.data.version,
        taglines: siteInfo.data.taglines,
        federated: siteInfo.data.federated_instances,
      },
      langs: discussionLangs,
    };

    return instanceData;
  }

  // start a job for each instances in the federation lists
  crawlFederatedInstances(federatedData) {
    const linked = federatedData.linked || [];
    const allowed = federatedData.allowed || [];
    const blocked = federatedData.blocked || [];

    // pull data from all federated instances
    let instancesDeDup = [...new Set([...linked, ...allowed, ...blocked])];

    for (var instance of instancesDeDup) {
      this.createJob(instance);
    }

    return instancesDeDup;
  }
}
