import Queue from "bee-queue";
import axios from "axios";

import {
  putInstanceData,
  storeFediverseInstance,
  storeError,
  getInstanceError,
  getInstanceData,
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

export default class CrawlInstance {
  constructor(isWorker) {
    this.queue = new Queue("instance", {
      removeOnSuccess: true,
      isWorker,
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
    const job = this.queue.createJob({ baseUrl: instanceBaseUrl });
    job.timeout(CRAWL_TIMEOUT.INSTANCE).retries(CRAWL_RETRY.INSTANCE).save();
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
      const now = new Date().getTime();

      return now - lastCrawl;
    }

    // check for recent error
    const lastError = await getInstanceError(instanceBaseUrl);
    if (lastError?.time) {
      // console.log("lastError", lastError.time);

      const lastErrorTime = lastError.time;
      const now = new Date().getTime();

      return now - lastErrorTime;
    }

    return false;
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        let instanceBaseUrl = job.data.baseUrl.toLowerCase();
        instanceBaseUrl = instanceBaseUrl.replace(/\s/g, ""); // remove spaces
        instanceBaseUrl = instanceBaseUrl.replace(/.*@/, ""); // remove anything before an @ if present

        // console.debug(
        //   `[Instance] [${job.data.baseUrl}] [${job.id}] Starting Crawl`
        // );

        // disallow * as a base url
        if (instanceBaseUrl === "*") {
          throw new Error("cannot crawl `*`");
        }

        // check if instance has already been crawled within CRAWL_EVERY
        const lastCrawledMsAgo = await this.getLastCrawlMsAgo(instanceBaseUrl);
        if (lastCrawledMsAgo && lastCrawledMsAgo < MIN_RECRAWL_MS) {
          throw new Error(
            `Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
          );
        }

        const instanceData = await this.crawlInstance(instanceBaseUrl);

        if (instanceData) {
          // store/update the instance
          await putInstanceData(instanceBaseUrl, {
            ...instanceData,
            lastCrawled: new Date().getTime(),
          });

          // create job to scan the instance for communities
          this.crawlCommunity.createJob(instanceBaseUrl);

          // attempt to crawl federated instances
          if (instanceData.siteData?.federated?.linked.length > 0) {
            this.crawlFederatedInstances(instanceData.siteData.federated);
          }

          console.log(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Completed OK (Found "${instanceData?.siteData?.site?.name}")`
          );
          return instanceData;
        } else {
          throw new Error("No instance data returned");
        }
      } catch (error) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          response: error.isAxiosError ? error.response : null,
          time: new Date().getTime(),
        };

        await storeError("instance", job.data.baseUrl, errorDetail);
        console.error(
          `[Instance] [${job.data.baseUrl}] [${job.id}] Error: ${error.message}`
        );
      }
      return null;
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
      throw new Error("missing /.well-known/nodeinfo links");
    }

    for (var linkRel of wellKnownInfo.data.links) {
      if (linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0") {
        nodeinfoUrl = linkRel.href;
      }
    }
    if (!nodeinfoUrl) {
      throw new Error("no diaspora rel in /.well-known/nodeinfo");
    }

    const nodeinfo2 = await this.axios.get(nodeinfoUrl);

    const software = nodeinfo2.data.software;

    // store all fediverse instance software for easy metrics
    await storeFediverseInstance(instanceBaseUrl, software);

    if (software.name != "lemmy" && software.name != "lemmybb") {
      throw new Error(`not a lemmy instance (${software.name})`);
    }

    const siteInfo = await this.axios.get(
      "https://" + instanceBaseUrl + "/api/v3/site"
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
    };

    return instanceData;
  }

  // start a job for each instances in the federation lists
  crawlFederatedInstances({ linked, allowed, blocked }) {
    for (var instance of linked) {
      this.createJob(instance);
    }
  }
}
