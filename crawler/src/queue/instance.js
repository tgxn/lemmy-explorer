import Queue from "bee-queue";
import logging from "../lib/logging.js";

import { isValidLemmyDomain } from "../lib/validator.js";
import storage from "../storage.js";

import { CrawlError, CrawlTooRecentError } from "../lib/error.js";
import { CRAWL_AGED_TIME } from "../lib/const.js";

import CommunityQueue from "./community.js";
import InstanceCrawler from "../crawl/instance.js";

import BaseQueue from "./queue.js";

export default class InstanceQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "instance") {
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
    const crawlCommunity = new CommunityQueue();

    const processor = async ({ baseUrl }) => {
      let instanceData = null;
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
          logging.error("baseUrl is not a valid lemmy domain", job.data);
          throw new CrawlError("baseUrl is not a valid domain");
        }

        logging.debug(`[Instance] [${baseUrl}] Starting Crawl`);

        // check if it's known to not be running lemmy (recan it if it's been a while)
        const knownFediverseServer = await storage.fediverse.getOne(
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
        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "instance",
          instanceBaseUrl
        );
        if (lastCrawlTs) {
          const lastCrawledMsAgo = Date.now() - lastCrawlTs;
          throw new CrawlTooRecentError(
            `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
          );
        }

        // check when the latest entry to errors was too recent
        const lastErrorTs = await storage.tracking.getOneError(
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
          const countFederated = await this.crawlFederatedInstanceJobs(
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
        await crawlCommunity.createJob(instanceBaseUrl);

        // set last successful crawl
        await storage.tracking.setLastCrawl("instance", baseUrl);
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `[Instance] [${baseUrl}] CrawlTooRecentError: ${error.message}`
          );
        } else {
          const errorDetail = {
            error: error.message,
            stack: error.stack,
            isAxiosError: error.isAxiosError,
            requestUrl: error.isAxiosError ? error.request.url : null,
            time: new Date().getTime(),
          };

          // if (error instanceof CrawlError || error instanceof AxiosError) {
          await storage.putRedis(`error:instance:${baseUrl}`, errorDetail);

          logging.error(`[Instance] [${baseUrl}] Error: ${error.message}`);
        }
      }

      return instanceData;
    };

    super(isWorker, queueName, processor);
  }

  async createJob(instanceBaseUrl, onSuccess = null) {
    // console.log("createJob", instanceBaseUrl);
    // replace http/s with nothign
    let trimmedUrl = instanceBaseUrl.replace(/^https?:\/\//, "").trim();

    // dont create blank jobs
    if (trimmedUrl == "") {
      console.warn("createJob: trimmedUrl is blank", instanceBaseUrl);
      return;
    }

    await super.createJob(trimmedUrl, { baseUrl: trimmedUrl }, onSuccess);
  }

  // start a job for each instances in the federation lists
  async crawlFederatedInstanceJobs(federatedData) {
    const linked = federatedData.linked || [];
    const allowed = federatedData.allowed || [];
    const blocked = federatedData.blocked || [];

    // pull data from all federated instances
    let instancesDeDup = [...new Set([...linked, ...allowed, ...blocked])];

    for (var instance of instancesDeDup) {
      if (isValidLemmyDomain(instance)) {
        await this.createJob(instance);
      }
    }

    return instancesDeDup;
  }

  // returns a amount os ms since we last crawled it, false if all good
  async getLastCrawlMsAgo(instanceBaseUrl) {
    const existingInstance = await storage.instance.getOne(instanceBaseUrl);

    if (existingInstance?.lastCrawled) {
      // logging.info("lastCrawled", existingInstance.lastCrawled);

      const lastCrawl = existingInstance.lastCrawled;
      const now = Date.now();

      return now - lastCrawl;
    }

    // check for recent error
    const lastError = await storage.tracking.getOneError(
      "instance",
      instanceBaseUrl
    );
    if (lastError?.time) {
      // logging.info("lastError", lastError.time);

      const lastErrorTime = lastError.time;
      const now = Date.now();

      return now - lastErrorTime;
    }

    return false;
  }
}
