import logging from "../lib/logging.js";

import Queue from "bee-queue";
import { AxiosError } from "axios";

import storage from "../storage.js";
import { isValidLemmyDomain } from "../lib/validator.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";
import {
  CRAWL_TIMEOUT,
  MIN_RECRAWL_MS,
  RECRAWL_FEDIVERSE_MS,
} from "../lib/const.js";

import CommunityQueue from "./community.js";
import InstanceCrawler from "../crawl/instance.js";

export default class InstanceQueue {
  constructor(isWorker = false, queueName = "instance") {
    this.queue = new Queue(queueName, {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(
        `InstanceQueue Job ${job.id} failed with error ${err.message}`,
        job,
        err
      );
    });

    this.crawlCommunity = new CommunityQueue();

    // if this is a worker thread, start the processing loop
    if (isWorker) this.process();
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

    logging.silly("InstanceQueue createJob", trimmedUrl);

    const job = this.queue.createJob({ baseUrl: trimmedUrl });
    await job
      .timeout(CRAWL_TIMEOUT.INSTANCE)
      .setId(trimmedUrl) // deduplicate
      .save();
    job.on("succeeded", (result) => {
      // logging.info(`Completed instanceQueue ${job.id}`, instanceBaseUrl);
      onSuccess && onSuccess(result);
    });
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

        logging.debug(`[Instance] [${job.data.baseUrl}] Starting Crawl`);

        // check if it's known to not be running lemmy
        const knownFediverseServer = await storage.fediverse.getOne(
          instanceBaseUrl
        );

        if (knownFediverseServer) {
          if (
            knownFediverseServer.name !== "lemmy" &&
            knownFediverseServer.name !== "lemmybb" &&
            knownFediverseServer.time &&
            Date.now() - knownFediverseServer.time < RECRAWL_FEDIVERSE_MS // re-scan fedi servers to check their status
          ) {
            throw new CrawlWarning(
              `Skipping - Known non-lemmy server ${knownFediverseServer.name}`
            );
          }
        }

        // // check if instance has already been crawled within CRAWL_EVERY
        // const lastCrawledMsAgo = await this.getLastCrawlMsAgo(instanceBaseUrl);
        // if (lastCrawledMsAgo && lastCrawledMsAgo < MIN_RECRAWL_MS) {
        //   throw new CrawlWarning(
        //     `Skipping - Crawled too recently (${lastCrawledMsAgo / 1000}s ago)`
        //   );
        // }

        const lastCrawlTs = await storage.tracking.getLastCrawl(
          "instance",
          instanceBaseUrl
        );
        if (lastCrawlTs) {
          const lastCrawledMsAgo = Date.now() - lastCrawlTs;
          if (lastCrawledMsAgo < MIN_RECRAWL_MS) {
            throw new CrawlWarning(
              `Skipping - Crawled too recently (${
                lastCrawledMsAgo / 1000
              }s ago)`
            );
          }
        }

        const crawler = new InstanceCrawler(instanceBaseUrl);
        const instanceData = await crawler.crawl();

        // start crawl jobs for federated instances
        if (instanceData.siteData?.federated?.linked.length > 0) {
          const countFederated = await this.crawlFederatedInstanceJobs(
            instanceData.siteData.federated
          );

          logging.info(
            `[Instance] [${job.data.baseUrl}] Created ${countFederated.length} federated instance jobs`
          );
        }

        // create job to scan the instance for communities once a crawl succeeds
        logging.info(
          `[Instance] [${job.data.baseUrl}] Creating community crawl job ${instanceBaseUrl}`
        );
        await this.crawlCommunity.createJob(instanceBaseUrl);

        return instanceData;
      } catch (error) {
        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: new Date().getTime(),
        };

        if (error instanceof CrawlError || error instanceof AxiosError) {
          await storage.putRedis(
            `error:instance:${job.data.baseUrl}`,
            errorDetail
          );

          logging.error(
            `[Instance] [${job.data.baseUrl}] Error: ${error.message}`
          );
        }

        // warning causes the job to leave the queue and no error to be created (it will be retried next time we add the job)
        else if (error instanceof CrawlWarning) {
          logging.warn(
            `[Instance] [${job.data.baseUrl}] Warn: ${error.message}`
          );
        } else {
          logging.verbose(
            `[Instance] [${job.data.baseUrl}] Error: ${error.message}`
          );
        }
      } finally {
        // set last scan time if it was success or failure.
        await storage.tracking.setLastCrawl("instance", job.data.baseUrl);
      }
      return true;
    });
  }
}
