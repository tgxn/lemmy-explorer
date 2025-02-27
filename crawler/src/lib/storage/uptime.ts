import { CrawlStorage } from "../crawlStorage";

import { IUptimeNodeData, IFullUptimeData } from "../../../../types/storage";

export default class Uptime {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFullUptimeData> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`uptime:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFullUptimeData) {
    return this.storage.putRedis(`uptime:${Date.now()}`, data);
  }
}
