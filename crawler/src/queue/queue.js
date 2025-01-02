import logging from "../lib/logging";

import Queue from "bee-queue";

import storage from "../storage.js";

import { CrawlTooRecentError } from "../lib/error.js";
import { REDIS_URL, CRAWL_TIMEOUT } from "../lib/const.js";

export default class BaseQueue {
  constructor(isWorker, queueName, jobProcessor) {
    this.queueName = queueName;
    this.jobProcessor = jobProcessor;

    this.logPrefix = `[Queue] [${this.queueName}]`;

    this.queue = new Queue(queueName, {
      redis: REDIS_URL,
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker: isWorker,
      getEvents: isWorker,
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

    job.on("succeeded", (result) => {
      logging.silly(`${this.logPrefix} ${job.id} succeeded`, jobData);
      onSuccess && onSuccess(result);
    });

    await job.timeout(CRAWL_TIMEOUT.KBIN).setId(jobId).save();
  }

  process() {
    this.queue.process(async (job) => {
      await storage.connect();

      let resultData = null;
      try {
        logging.info(
          `${this.logPrefix} [${job.data.baseUrl}] Running Processor`
        );

        resultData = await this.jobProcessor(job.data);
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(
            `${this.logPrefix} [${job.data.baseUrl}] CrawlTooRecentError: ${error.message}`
          );
        } else {
          // store all other errors
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
        }
      }

      // close redis connection on end of job
      await storage.close();
      return resultData;
    });
  }
}
