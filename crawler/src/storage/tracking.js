// type TrackingData = {
//   error: string;
//   stack: string;
//   isAxiosError: boolean;
//   time: number;
// };

import { RECORD_TTL_TIMES_SECONDS } from "../lib/const.js";

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

    return this.storage.putRedisTTL(
      `${this.failureKey}:${type}:${baseUrl}`,
      errorDetail,
      RECORD_TTL_TIMES_SECONDS.ERROR
    );
  }

  // track last scans for instance and communities
  async getLastCrawl(type, baseUrl) {
    return this.storage.getRedis(`${this.historyKey}:${type}:${baseUrl}`);
  }

  async listAllLastCrawl() {
    return this.storage.listRedisWithKeys(`${this.historyKey}:*`);
  }

  async setLastCrawl(type, baseUrl, data = null) {
    if (!baseUrl) throw new Error("baseUrl is required");

    return this.storage.putRedisTTL(
      `${this.historyKey}:${type}:${baseUrl}`,
      { time: Date.now(), ...data },
      RECORD_TTL_TIMES_SECONDS.LAST_CRAWL
    );
  }
}
