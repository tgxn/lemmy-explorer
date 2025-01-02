import Storage from "../crawlStorage";

export default class Uptime {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async getLatest() {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`uptime:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data) {
    return this.storage.putRedis(`uptime:${Date.now()}`, data);
  }
}
