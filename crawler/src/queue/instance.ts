import logging from "../lib/logging";
import storage from "../storage";

import { CRAWL_AGED_TIME } from "../lib/const";
import { CrawlError, CrawlTooRecentError } from "../lib/error";
import { isValidLemmyDomain } from "../lib/validator";

import BaseQueue, { IJobProcessor, ISuccessCallback } from "./BaseQueue";

import CommunityQueue from "./community";
import InstanceCrawler from "../crawl/instance";

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

    const processor: IJobProcessor = async ({ baseUrl }) => {
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
        await storage.tracking.setLastCrawl("instance", baseUrl, {
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
        } else if (error instanceof CrawlError) {
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

          await storage.tracking.upsertError("instance", baseUrl, errorDetail);
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

          await storage.tracking.upsertError("instance", baseUrl, errorDetail);
        }
      }

      return null;
    };

    super(isWorker, queueName, processor);
  }

  async createJob(
    instanceBaseUrl: string,
    onSuccess: ISuccessCallback | null = null
  ) {
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
  async getLastCrawlMsAgo(instanceBaseUrl: string) {
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
