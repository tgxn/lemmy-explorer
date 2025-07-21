import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import type { IIncomingMagazineData } from "../crawl/mbin";

import BaseQueue, { ISuccessCallback } from "./BaseQueue";

import { mbinInstanceProcessor } from "../crawl/mbin";

export default class MBinQueue extends BaseQueue<IIncomingMagazineData[] | boolean> {
  constructor(isWorker = false, queueName = "mbin") {
    super(isWorker, queueName, mbinInstanceProcessor);
  }

  // use as MBinQueue.createJob({ baseUrl: "https://fedia.io" });
  async createJob(
    baseUrl: string,
    onSuccess: ISuccessCallback<IIncomingMagazineData[] | boolean> | null = null,
  ) {
    await super.createJob(baseUrl, { baseUrl }, onSuccess);
  }
}
