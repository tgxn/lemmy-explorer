import { CrawlStorage } from "../crawlStorage";

export type IMagazineData = {
  magazineId: number;
  owner: {
    magazineId: number;
    userId: number;
    avatar: any;
    username: string;
    apId: any;
  };
  icon: any;
  name: string;
  title: string;
  description: string;
  rules: string;
  subscriptionsCount: number;
  entryCount: number;
  entryCommentCount: number;
  postCount: number;
  postCommentCount: number;
  isAdult: boolean;
  isUserSubscribed: any;
  isBlockedByUser: any;
  tags: any;
  badges: any[];
  moderators: {
    magazineId: number;
    userId: number;
    avatar: any;
    username: string;
    apId: any;
  }[];
  apId: any;
  apProfileId: string;
  serverSoftware: any;
  serverSoftwareVersion: any;
  isPostingRestrictedToMods: boolean;
  lastCrawled?: number;
};
export type IMagazineDataKeyValue = {
  [key: string]: IMagazineData;
};

export default class MBinStore {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IMagazineData[]> {
    return this.storage.listRedis(`mbin_magazine:*`);
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
    attributeValue: string,
  ) {
    return await this.storage.redisZAdd(
      `attributes:mbin_magazine:${baseUrl}:${magazineName}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }
}
