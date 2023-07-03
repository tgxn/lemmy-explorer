import logging from "../lib/logging.js";

import Queue from "bee-queue";

import storage from "../storage.js";

import { CrawlTooRecentError } from "../lib/error.js";
import { CRAWL_TIMEOUT } from "../lib/const.js";

export default class BaseQueue {
  constructor(isWorker = false, queueName, jobProcessor) {
    this.queueName = queueName;
    this.jobProcessor = jobProcessor;

    this.logPrefix = `[Queue] [${this.queueName}]`;

    this.queue = new Queue(queueName, {
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker,
    });

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(
        `${this.logPrefix} job:${job.id} failed with error: ${err.message}`,
        job,
        err
      );
    });

    if (isWorker) this.process();
  }

  async createJob(jobId, jobData, onSuccess = null) {
    const job = this.queue.createJob(jobData);
    logging.silly(`${this.logPrefix} createJob`, jobData);

    await job.timeout(CRAWL_TIMEOUT.KBIN).setId(jobId).save();
    job.on("succeeded", (result) => {
      onSuccess && onSuccess(result);
    });
  }

  async process() {
    this.queue.process(async (job) => {
      try {
        logging.info(
          `${this.logPrefix} [${job.data.baseUrl}] Running Processor`
        );

        const resultData = await this.jobProcessor(job.data);
        return resultData;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `${this.logPrefix} [${job.data.baseUrl}] CrawlTooRecentError: ${error.message}`
          );
          return true;
        }

        const errorDetail = {
          error: error.message,
          stack: error.stack,
          isAxiosError: error.isAxiosError,
          requestUrl: error.isAxiosError ? error.request.url : null,
          time: Date.now(),
        };

        // if (error instanceof CrawlError || error instanceof AxiosError) {
        await storage.tracking.upsertError(
          this.queueName,
          job.data.baseUrl,
          errorDetail
        );

        logging.error(
          `${this.logPrefix} [${job.data.baseUrl}] Error: ${error.message}`,
          error
        );
        //   }

        //   // warning causes the job to leave the queue and no error to be created (it will be retried next time we add the job)
        //   else if (error instanceof CrawlTooRecentError) {
        //     logging.warn(
        //       `[Community] [${job.data.baseUrl}] Warn: ${error.message}`
        //     );
        //   } else {
        //     logging.verbose(
        //       `[Community] [${job.data.baseUrl}] Error: ${error.message}`
        //     );
        //   }
        // } finally {
        //   // set last scan time if it was success or failure.
        //   await storage.tracking.setLastCrawl("community", job.data.baseUrl);
      }
      return false;
    });
  }
}
