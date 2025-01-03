import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import { instanceProcessor } from "../crawl/instance";

export default class InstanceQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "instance") {
    super(isWorker, queueName, instanceProcessor);
  }

  async createJob(instanceBaseUrl: string, onSuccess: ISuccessCallback | null = null) {
    // replace http/s with nothing
    let trimmedUrl = instanceBaseUrl.replace(/^https?:\/\//, "").trim();

    // dont create blank jobs
    if (trimmedUrl == "") {
      console.warn("createJob: trimmedUrl is blank", instanceBaseUrl);
      return;
    }

    await super.createJob(trimmedUrl, { baseUrl: trimmedUrl }, onSuccess);
  }
}
