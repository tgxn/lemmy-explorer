import { CrawlStorage } from "../crawlStorage";

import { IPiefedCommunityData, IPiefedCommunityDataKeyValue } from "../../../../types/storage";

export default class PiefedStore {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IPiefedCommunityData[]> {
    const communityKeyValue = await this.storage.listRedisWithKeys(`piefed_community:*`);

    // put baseUrl into the magazine object
    for (const key in communityKeyValue) {
      communityKeyValue[key].baseurl = key.split(":")[1];
    }

    return Object.values(communityKeyValue);
  }

  async getAllWithKeys(): Promise<IPiefedCommunityDataKeyValue> {
    return this.storage.listRedisWithKeys(`piefed_community:*`);
  }

  async getOne(baseUrl: string, communityName: string) {
    return this.storage.getRedis(`piefed_community:${baseUrl}:${communityName}`);
  }

  async upsert(baseUrl: string, community: IPiefedCommunityData) {
    const storeData = {
      ...community,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(`piefed_community:${baseUrl}:${community.community.name.toLowerCase()}`, storeData);
  }

  async delete(baseUrl: string, communityName: string, reason = "unknown") {
    const oldRecord = await this.getOne(baseUrl, communityName);
    await this.storage.putRedis(`deleted:piefed_community:${baseUrl}:${communityName}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    return this.storage.deleteRedis(`piefed_community:${baseUrl}:${communityName}`);
  }

  // use these to track community attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    communityName: string,
    attributeName: string,
    attributeValue: string | number,
  ) {
    return await this.storage.redisZAdd(
      `attributes:piefed_community:${baseUrl}:${communityName}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }
}
