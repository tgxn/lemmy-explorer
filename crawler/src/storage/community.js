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
  constructor(storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedis(`community:*`);
  }
  async getOne(key) {
    return this.storage.getRedis(`community:${key}`);
  }
  async upsert(baseUrl, data) {
    return this.storage.putRedis(
      `community:${baseUrl}:${data.community.name.toLowerCase()}`,
      data
    );
  }
}
