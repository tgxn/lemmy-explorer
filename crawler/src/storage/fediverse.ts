import { CrawlStorage } from "../crawlStorage";

export type FediverseData = {
  time?: number;
  baseurl?: string;
  name?: string;
  version?: string;
  repository?: string;
  homepage?: string;
};

export type FediverseKeyValue = {
  [key: string]: FediverseData;
};

export default class Fediverse {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<FediverseKeyValue> {
    return this.storage.listRedisWithKeys(`fediverse:*`);
  }

  async getOne(baseUrl: string): Promise<FediverseData> {
    return this.storage.getRedis(`fediverse:${baseUrl}`);
  }

  async upsert(baseUrl: string, data: FediverseData) {
    const dd = { baseurl: baseUrl, time: Date.now(), ...data };
    return this.storage.putRedis(`fediverse:${baseUrl}`, dd);
  }
}
