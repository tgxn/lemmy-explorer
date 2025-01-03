import { CrawlStorage } from "../crawlStorage";

export type ICommunityData = {
  community: {
    id: number;
    name: string;
    title: string;
    description: string;
    removed: boolean;
    published: string;
    updated: string | null;
    deleted: boolean;
    nsfw: boolean;
    actor_id: string;
    local: boolean;
    icon: string | null;
    banner: string | null;
    hidden: boolean;
    posting_restricted_to_mods: boolean;
    instance_id: number;
  };
  subscribed: string;
  blocked: boolean;
  counts: Object;
  banned_from_community?: boolean;
  lastCrawled: number;
};

export type ICommunityDataKeyValue = {
  [key: string]: ICommunityData;
};

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
    return this.storage.getRedis(`community:${baseUrl}:${communityName}`);
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
    await this.storage.putRedis(`deleted:community:${baseUrl}:${communityName}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    return this.storage.deleteRedis(`community:${baseUrl}:${communityName}`);
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
