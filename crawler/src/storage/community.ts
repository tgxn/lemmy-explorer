import Storage from "../storage";

// type CommunityData = {
//   community: {
//     id: number;
//     name: string;
//     title: string;
//     description: string;
//     removed: boolean;
//     published: string;
//     updated: string | null;
//     deleted: boolean;
//     nsfw: boolean;
//     actor_id: string;
//     local: boolean;
//     icon: string | null;
//     banner: string | null;
//     hidden: boolean;
//     posting_restricted_to_mods: boolean;
//     instance_id: number;
//   };
//   subscribed: string;
//   blocked: boolean;
//   counts: Object;
//   lastCrawled: number;
// };

export default class Community {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedis(`community:*`);
  }

  async getAllWithKeys() {
    return this.storage.listRedisWithKeys(`community:*`);
  }

  async getOne(baseUrl, communityName) {
    return this.storage.getRedis(`community:${baseUrl}:${communityName}`);
  }

  async upsert(baseUrl, community) {
    const storeData = {
      ...community,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(
      `community:${baseUrl}:${community.community.name.toLowerCase()}`,
      storeData
    );
  }

  async delete(baseUrl, communityName, reason = "unknown") {
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
    baseUrl,
    communityName,
    attributeName,
    attributeValue
  ) {
    return this.storage.redisZAdd(
      `attributes:community:${baseUrl}:${communityName}:${attributeName}`,
      Date.now(),
      attributeValue
    );
  }
}
