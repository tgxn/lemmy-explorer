import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import type { ICommunityData } from "../../../types/storage";

import { communityListProcessor } from "../crawl/community";

export default class CommunityListQueue extends BaseQueue<ICommunityData[] | null> {
  constructor(isWorker = false, queueName = "community") {
    super(isWorker, queueName, communityListProcessor);
  }

  async createJob(instanceBaseUrl: string, onSuccess: ISuccessCallback<ICommunityData[] | null> = null) {
    const trimmedUrl = instanceBaseUrl.trim();

    return await super.createJob(
      trimmedUrl,
      {
        baseUrl: trimmedUrl,
      },
      onSuccess,
    );
  }
}
