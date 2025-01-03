import { CrawlStorage } from "../crawlStorage";

export type IMagazineData = {
  baseUrl: string;
  name: string;
  description: string;
  lastCrawled: number;
  [key: string]: any;
};

export type IMagazineDataKeyValue = {
  [key: string]: IMagazineData;
};

export default class KBinStore {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IMagazineData[]> {
    return this.storage.listRedis(`magazine:*`);
  }

  async getAllWithKeys(): Promise<IMagazineDataKeyValue> {
    return this.storage.listRedisWithKeys(`magazine:*`);
  }

  async getOne(baseUrl: string, magazineName: string) {
    return this.storage.getRedis(`magazine:${baseUrl}:${magazineName}`);
  }

  async upsert(baseUrl: string, magazine: IMagazineData) {
    const storeData = {
      ...magazine,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(`magazine:${baseUrl}:${magazine.name.toLowerCase()}`, storeData);
  }

  async delete(baseUrl: string, magazineName: string, reason = "unknown") {
    const oldRecord = await this.getOne(baseUrl, magazineName);
    await this.storage.putRedis(`deleted:magazine:${baseUrl}:${magazineName}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    return this.storage.deleteRedis(`magazine:${baseUrl}:${magazineName}`);
  }

  // use these to track magazine attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    magazineName: string,
    attributeName: string,
    attributeValue: string,
  ) {
    return await this.storage.redisZAdd(
      `attributes:magazine:${baseUrl}:${magazineName}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }
}
