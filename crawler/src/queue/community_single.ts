import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import { singleCommunityProcessor } from "../crawl/community";

export default class SingleCommunityQueue extends BaseQueue {
  constructor(isWorker = false, queueName = "one_community") {
    super(isWorker, queueName, singleCommunityProcessor);
  }

  async createJob(
    baseUrl: string,
    communityName: string,
    onSuccess: ISuccessCallback = null
  ) {
    const trimmedUrl = baseUrl.trim();

    return await super.createJob(
      trimmedUrl,
      {
        baseUrl: trimmedUrl,
        community: communityName,
      },
      onSuccess
    );
  }
}
