import { CrawlStorage } from "../crawlStorage";

import { IFediseerInstanceDataTagsObject } from "../../../../types/storage";

export default class Fediseer {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFediseerInstanceDataTagsObject[]> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFediseerInstanceDataTagsObject[]) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
