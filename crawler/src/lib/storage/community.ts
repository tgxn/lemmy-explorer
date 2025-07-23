import { CrawlStorage } from "../crawlStorage";

import { ICommunityData, ICommunityDataKeyValue } from "../../../../types/storage";

export default class Community {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<ICommunityData[]> {
    return this.storage.listRedis(`community:*`);
  }

  async getAllWithKeys(): Promise<ICommunityDataKeyValue> {
    return this.storage.listRedisWithKeys(`community:*`);
  }

  async getOne(baseUrl: string, communityName: string): Promise<ICommunityData> {
    return this.storage.getRedis(`community:${baseUrl}:${communityName.toLowerCase()}`);
  }

  async upsert(baseUrl: string, community: ICommunityData) {
    const storeData = {
      ...community,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(`community:${baseUrl}:${community.community.name.toLowerCase()}`, storeData);
  }

  async delete(baseUrl: string, communityName: string, reason: string = "unknown") {
    const oldRecord = await this.getOne(baseUrl, communityName);

    await this.storage.putRedis(`deleted:community:${baseUrl}:${communityName.toLowerCase()}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    const deletedCommunity = await this.storage.deleteRedis(`community:${baseUrl}:${communityName.toLowerCase()}`);

    return deletedCommunity;
  }

  // use these to track community attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    communityName: string,
    attributeName: string,
    attributeValue: string,
  ) {
    return this.storage.redisZAdd(
      `attributes:community:${baseUrl}:${communityName}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }
}
