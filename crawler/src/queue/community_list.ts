import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import { communityListProcessor } from "../crawl/community";

export default class CommunityListQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "community") {
    super(isWorker, queueName, communityListProcessor);
  }

  async createJob(instanceBaseUrl: string, onSuccess: ISuccessCallback = null) {
    const trimmedUrl = instanceBaseUrl.trim();

    return await super.createJob(
      trimmedUrl,
      {
        baseUrl: trimmedUrl,
      },
      onSuccess
    );
  }
}
