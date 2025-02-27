import { CrawlStorage } from "../crawlStorage";

import { IFediseerInstanceData } from "../../../../types/storage";

export default class Fediseer {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFediseerInstanceData[]> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFediseerInstanceData[]) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
