import { CrawlStorage } from "../crawlStorage";

export type IFediseerData = {
  id: number;
  domain: string;
  software: string;
  claimed: number;
  open_registrations: boolean;
  email_verify: boolean;
  approvals: number;
  endorsements: number;
  guarantor: string;
};

export default class Fediseer {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFediseerData[]> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFediseerData[]) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
