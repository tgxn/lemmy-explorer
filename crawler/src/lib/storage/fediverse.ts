import { CrawlStorage } from "../crawlStorage";

import { IFediverseData, IFediverseDataKeyValue } from "../../../../types/storage";

export default class Fediverse {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IFediverseDataKeyValue> {
    return this.storage.listRedisWithKeys(`fediverse:*`);
  }

  async getOne(baseUrl: string): Promise<IFediverseData> {
    return this.storage.getRedis(`fediverse:${baseUrl}`);
  }

  async upsert(baseUrl: string, data: IFediverseData) {
    const dd = { baseurl: baseUrl, time: Date.now(), ...data };
    return this.storage.putRedis(`fediverse:${baseUrl}`, dd);
  }
}
