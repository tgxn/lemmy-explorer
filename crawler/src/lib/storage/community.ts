import { CrawlStorage } from "../crawlStorage";

export type CommunityData = {
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

export type CommunityDataKeyValue = {
  [key: string]: CommunityData;
};

export default class Community {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<CommunityData[]> {
    return this.storage.listRedis(`community:*`);
  }

  async getAllWithKeys(): Promise<CommunityDataKeyValue> {
    return this.storage.listRedisWithKeys(`community:*`);
  }

  async getOne(baseUrl: string, communityName: string): Promise<CommunityData> {
    return this.storage.getRedis(`community:${baseUrl}:${communityName}`);
  }

  async upsert(baseUrl: string, community: CommunityData) {
    const storeData = {
      ...community,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(
      `community:${baseUrl}:${community.community.name.toLowerCase()}`,
      storeData
    );
  }

  async delete(
    baseUrl: string,
    communityName: string,
    reason: string = "unknown"
  ) {
    const oldRecord = await this.getOne(baseUrl, communityName);
    await this.storage.putRedis(
      `deleted:community:${baseUrl}:${communityName}`,
      {
        ...oldRecord,
        deletedAt: Date.now(),
        deleteReason: reason,
      }
    );

    return this.storage.deleteRedis(`community:${baseUrl}:${communityName}`);
  }

  // use these to track community attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    communityName: string,
    attributeName: string,
    attributeValue: string
  ) {
    return this.storage.redisZAdd(
      `attributes:community:${baseUrl}:${communityName}:${attributeName}`,
      Date.now(),
      attributeValue
    );
  }
}
