import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import { CrawlTooRecentError } from "../lib/error";

import BaseQueue, { IJobProcessor, ISuccessCallback } from "./BaseQueue";

import { piefedInstanceProcessor } from "../crawl/piefed";

export default class PiefedQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "piefed") {
    super(isWorker, queueName, piefedInstanceProcessor);
  }

  // use as PiefedQueue.createJob({ baseUrl: "https://piefed.social" });
  async createJob(baseUrl: string, onSuccess: ISuccessCallback | null = null) {
    await super.createJob(baseUrl, { baseUrl }, onSuccess);
  }
}
