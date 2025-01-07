import { CrawlStorage } from "../crawlStorage";

import { IMagazineData, IMagazineDataKeyValue } from "../../../../types/storage";

export default class MBinStore {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IMagazineData[]> {
    const magazineKeyValue = await this.storage.listRedisWithKeys(`mbin_magazine:*`);

    // put baseUrl into the magazine object
    for (const key in magazineKeyValue) {
      magazineKeyValue[key].baseurl = key.split(":")[1];
    }

    return Object.values(magazineKeyValue);
  }

  async getAllWithKeys(): Promise<IMagazineDataKeyValue> {
    return this.storage.listRedisWithKeys(`mbin_magazine:*`);
  }

  async getOne(baseUrl: string, magazineName: string) {
    return this.storage.getRedis(`mbin_magazine:${baseUrl}:${magazineName}`);
  }

  async upsert(baseUrl: string, magazine: IMagazineData) {
    const storeData = {
      ...magazine,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(`mbin_magazine:${baseUrl}:${magazine.name.toLowerCase()}`, storeData);
  }

  async delete(baseUrl: string, magazineName: string, reason = "unknown") {
    const oldRecord = await this.getOne(baseUrl, magazineName);
    await this.storage.putRedis(`deleted:mbin_magazine:${baseUrl}:${magazineName}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    return this.storage.deleteRedis(`mbin_magazine:${baseUrl}:${magazineName}`);
  }

  // use these to track magazine attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    magazineName: string,
    attributeName: string,
    attributeValue: string | number,
  ) {
    return await this.storage.redisZAdd(
      `attributes:mbin_magazine:${baseUrl}:${magazineName}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }
}
