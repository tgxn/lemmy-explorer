import logging from "../lib/logging.js";

import Queue from "bee-queue";
import axios, { AxiosError } from "axios";

import { isValidLemmyDomain } from "../lib/validator.js";
import {
  putInstanceData,
  storeFediverseInstance,
  storeError,
  getError,
  getInstanceData,
  getFediverseData,
  listInstanceData,
} from "../lib/storage.js";

import CommunityQueue from "./community.js";

import {
  CRAWL_TIMEOUT,
  CRAWL_RETRY,
  MIN_RECRAWL_MS,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
  AXIOS_REQUEST_TIMEOUT,
} from "../lib/const.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";

import InstanceCrawler from "../crawl/instance.js";

export default class InstanceQueue {
  constructor(isWorker = false) {
    this.queue = new Queue("instance", {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(`Job ${job.id} failed with error ${err.message}`, err);
    });

    // this.axios = axios.create({
    //   timeout: AXIOS_REQUEST_TIMEOUT,
    //   headers: {
    //     "User-Agent": CRAWLER_USER_AGENT,
    //     "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
    //   },
    // });

    this.crawlCommunity = new CommunityQueue();

    // if this is a worker thread, start the processing loop
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
    //   logging.info(`Completed instanceQueue ${job.id}`, instanceBaseUrl);
    // });
  }

  // start a job for each instances in the federation lists
  crawlFederatedInstanceJobs(federatedData) {
    const linked = federatedData.linked || [];
    const allowed = federatedData.allowed || [];
    const blocked = federatedData.blocked || [];

    // pull data from all federated instances
    let instancesDeDup = [...new Set([...linked, ...allowed, ...blocked])];

    for (var instance of instancesDeDup) {
      if (isValidLemmyDomain(instance)) {
        this.createJob(instance);
      }
    }

    return instancesDeDup;
  }

  // returns a amount os ms since we last crawled it, false if all good
  async getLastCrawlMsAgo(instanceBaseUrl) {
    const existingInstance = await getInstanceData(instanceBaseUrl);

    if (existingInstance?.lastCrawled) {
      // logging.info("lastCrawled", existingInstance.lastCrawled);

      const lastCrawl = existingInstance.lastCrawled;
      const now = Date.now();

      return now - lastCrawl;
    }

    // check for recent error
    const lastError = await getError("instance", instanceBaseUrl);
    if (lastError?.time) {
      // logging.info("lastError", lastError.time);

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
          logging.error("baseUrl is not a string", job.data);
          throw new CrawlError("baseUrl is not a string");
        }

        // try to clean up the url
        let instanceBaseUrl = job.data.baseUrl.toLowerCase();
        instanceBaseUrl = instanceBaseUrl.replace(/\s/g, ""); // remove spaces
        instanceBaseUrl = instanceBaseUrl.replace(/.*@/, ""); // remove anything before an @ if present
        instanceBaseUrl = instanceBaseUrl.trim();

        // if it's not a valid, put it in errors so it doesn't get hit again
        if (!isValidLemmyDomain(instanceBaseUrl)) {
          logging.error("baseUrl is not a valid lemmy domain", job.data);
          throw new CrawlError("baseUrl is not a valid domain");
        }

        logging.debug(
          `[Instance] [${job.data.baseUrl}] [${job.id}] Starting Crawl`
        );

        // check if it's known to not be running lemmy
        const knownFediverseServer = await getFediverseData(instanceBaseUrl);
        if (knownFediverseServer) {
          if (
            knownFediverseServer.name !== "lemmy" &&
            knownFediverseServer.name !== "lemmybb"
          ) {
            throw new CrawlWarning(
              `Skipping - Known non-lemmy server ${knownFediverseServer.name}`
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

        const crawler = new InstanceCrawler(instanceBaseUrl);
        const instanceData = await crawler.crawl();

        // create job to scan the instance for communities once a crawl succeeds
        this.crawlCommunity.createJob(instanceBaseUrl);

        return instanceData;
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

          logging.error(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Error: ${error.message}`
          );
        } else if (error instanceof CrawlWarning) {
          logging.warn(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Warn: ${error.message}`
          );
        } else {
          logging.error(
            `[Instance] [${job.data.baseUrl}] [${job.id}] Error: ${error.message}`
          );
          logging.trace(error);
        }
      }
      return true;
    });
  }
}
