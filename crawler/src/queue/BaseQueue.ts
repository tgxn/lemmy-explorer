import BeeQueue from "bee-queue";

import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import { CrawlTooRecentError } from "../lib/error";
import { REDIS_URL, CRAWL_TIMEOUT } from "../lib/const";

export type IJobData = { baseUrl?: string; community?: string };

export type IJobProcessor<T> = (processorConfig: IJobData) => Promise<T | null>;

// export type ISuccessCallback = ((resultData: any) => void) | null;
export type ISuccessCallback<T> = ((resultData: T) => void) | null;
// export type ISuccessCallback1 = ISuccessCallback | null;

export default class BaseQueue<T> {
  protected queueName: string;
  protected logPrefix: string;

  // public to be accessed to get health etc
  public queue: BeeQueue;

  protected jobProcessor: IJobProcessor<T | null>;

  constructor(isWorker: boolean, queueName: string, jobProcessor: IJobProcessor<T>) {
    this.queueName = queueName;

    this.queue = new BeeQueue(queueName, {
      redis: REDIS_URL,
      removeOnSuccess: true,
      removeOnFailure: true,
      isWorker: isWorker,
      getEvents: isWorker,
    });

    this.logPrefix = `[Queue] [${this.queueName}]`;

    this.jobProcessor = jobProcessor;

    // report failures!
    this.queue.on("failed", (job, err) => {
      logging.error(`${this.logPrefix} job:${job.id} failed with error: ${err.message}`, job, err);
    });

    if (isWorker) this.process();
  }

  async createJob(jobId: string, jobData: any, onSuccess: ISuccessCallback<T> = null) {
    const job = this.queue.createJob(jobData);
    logging.silly(`${this.logPrefix} createJob`, jobData);

    job.on("succeeded", (result) => {
      logging.silly(`${this.logPrefix} ${job.id} succeeded`, jobData);
      onSuccess && onSuccess(result);
    });

    await job.timeout(CRAWL_TIMEOUT.DEFAULT).setId(jobId).save();
  }

  process(): void {
    this.queue.process(async (job) => {
      await storage.connect();

      try {
        logging.info(`${this.logPrefix} [${job.data.baseUrl}] Running Processor`);

        const resultData = await this.jobProcessor(job.data);

        if (!resultData) {
          logging.warn(`${this.logPrefix} [${job.data.baseUrl}] Processor returned null or undefined`);
          throw new Error("Processor returned null or undefined");
        }

        // close redis connection on end of job
        await storage.close();

        return resultData;
      } catch (error) {
        if (error instanceof CrawlTooRecentError) {
          logging.warn(`${this.logPrefix} [${job.data.baseUrl}] CrawlTooRecentError: ${error.message}`);
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
          await storage.tracking.upsertError(this.queueName, job.data.baseUrl, errorDetail);

          logging.error(`${this.logPrefix} [${job.data.baseUrl}] Error: ${error.message}`, error);
        }

        // close redis connection on end of job
        await storage.close();

        return null;
      }
    });
  }
}
