export default class Fediseer {
  constructor(storage) {
    this.storage = storage;
  }

  async getLatest() {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
