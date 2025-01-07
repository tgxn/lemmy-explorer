import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import { CrawlTooRecentError } from "../lib/error";

import BaseQueue, { IJobProcessor, ISuccessCallback } from "./BaseQueue";

import { mbinInstanceProcessor } from "../crawl/mbin";

export default class MBinQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "mbin") {
    super(isWorker, queueName, mbinInstanceProcessor);
  }

  // use as MBinQueue.createJob({ baseUrl: "https://fedia.io" });
  async createJob(baseUrl: string, onSuccess: ISuccessCallback | null = null) {
    await super.createJob(baseUrl, { baseUrl }, onSuccess);
  }
}
