import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import type { IInstanceData } from "../../../types/storage";

import { instanceProcessor } from "../crawl/instance";
import logging from "../lib/logging";

export default class InstanceQueue extends BaseQueue<IInstanceData | null> {
  constructor(isWorker = false, queueName = "instance") {
    super(isWorker, queueName, instanceProcessor);
  }

  async createJob(instanceBaseUrl: string, onSuccess: ISuccessCallback<IInstanceData | null> | null = null) {
    // replace http/s with nothing
    let trimmedUrl = instanceBaseUrl.replace(/^https?:\/\//, "").trim();

    // dont create blank jobs
    if (trimmedUrl == "") {
      logging.warn("createJob: trimmedUrl is blank", instanceBaseUrl);
      return;
    }

    await super.createJob(trimmedUrl, { baseUrl: trimmedUrl }, onSuccess);
  }
}
