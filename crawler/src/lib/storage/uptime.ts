import { CrawlStorage } from "../crawlStorage";

export type IUptimeNodeData = {
  domain: string;
  latency: number;
  countryname: string;
  uptime_alltime: string;
  date_created: string;
  date_updated: string;
  date_laststats: string;
  score: number;
  status: number;
};

export type IFullUptimeData = {
  timestamp: number;
  nodes: IUptimeNodeData[];
};

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
