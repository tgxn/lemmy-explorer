// type FediverseData = {
//   name: string;
//   version: string;
// };

export default class Fediverse {
  constructor(storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedisWithKeys(`fediverse:*`);
  }
  async getOne(baseUrl) {
    return this.storage.getRedis(`fediverse:${baseUrl}`);
  }
  async upsert(baseUrl, data) {
    const dd = { time: Date.now(), ...data };
    return this.storage.putRedis(`fediverse:${baseUrl}`, dd);
  }
}
