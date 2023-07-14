// type TrackingData = {
//   error: string;
//   stack: string;
//   isAxiosError: boolean;
//   time: number;
// };

export default class TrackingStore {
  constructor(storage) {
    this.storage = storage;

    this.failureKey = "error";
    this.historyKey = "last_crawl";
  }

  // track errors
  async getAllErrors(type) {
    return this.storage.listRedisWithKeys(`${this.failureKey}:${type}:*`);
  }
  async getOneError(type, key) {
    return this.storage.getRedis(`${this.failureKey}:${type}:${key}`);
  }
  async upsertError(type, baseUrl, errorDetail) {
    if (!baseUrl) throw new Error("baseUrl is required");

    // 12 hours
    const expireInSeconds = 12 * 60 * 60;
    return this.storage.putRedisTTL(
      `${this.failureKey}:${type}:${baseUrl}`,
      errorDetail,
      expireInSeconds
    );
  }

  // track last scans for instance and communities
  async getLastCrawl(type, baseUrl) {
    return this.storage.getRedis(`${this.historyKey}:${type}:${baseUrl}`);
  }

  async setLastCrawl(type, baseUrl) {
    if (!baseUrl) throw new Error("baseUrl is required");

    // 12 hours
    const expireInSeconds = 12 * 60 * 60;
    return this.storage.putRedisTTL(
      `${this.historyKey}:${type}:${baseUrl}`,
      Date.now(),
      expireInSeconds
    );
  }
}
