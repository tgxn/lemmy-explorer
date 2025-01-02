import logging from "../lib/logging";
import crawlStorage from "../lib/crawlStorage";

import { CRAWL_AGED_TIME } from "../lib/const";
import { CrawlError, CrawlTooRecentError } from "../lib/error";
import { isValidLemmyDomain } from "../lib/validator";

import BaseQueue, { IJobProcessor, ISuccessCallback } from "./BaseQueue";

// import CommunityQueue from "./community_list";
import { instanceProcessor } from "../crawl/instance";

export default class InstanceQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "instance") {
    // const crawlCommunity = new CommunityQueue();

    super(isWorker, queueName, instanceProcessor);
  }

  async createJob(instanceBaseUrl: string, onSuccess: ISuccessCallback | null = null) {
    // console.log("createJob", instanceBaseUrl);
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
