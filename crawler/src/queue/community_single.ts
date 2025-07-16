import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import type { ICommunityData } from "../../../types/storage";

import { singleCommunityProcessor } from "../crawl/community";

export default class SingleCommunityQueue extends BaseQueue<ICommunityData | null> {
  constructor(isWorker = false, queueName = "one_community") {
    super(isWorker, queueName, singleCommunityProcessor);
  }

  async createJob(
    baseUrl: string,
    communityName: string,
    onSuccess: ISuccessCallback<ICommunityData | null> = null,
  ) {
    const trimmedUrl = baseUrl.trim();

    return await super.createJob(
      trimmedUrl + ":" + communityName,
      {
        baseUrl: trimmedUrl,
        community: communityName,
      },
      onSuccess,
    );
  }
}
