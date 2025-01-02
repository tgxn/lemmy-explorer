import { CrawlStorage } from "../crawlStorage";

export type ErrorData = {
  error: string;
  stack: string;
  isAxiosError?: boolean;
  time: number;
};

export type ErrorDataKeyValue = {
  [key: string]: ErrorData;
};

export type LastCrawlData = {
  time: number;
};

import { RECORD_TTL_TIMES_SECONDS } from "../lib/const";

export default class TrackingStore {
  private storage: CrawlStorage;

  private failureKey: string;
  private historyKey: string;

  constructor(storage: CrawlStorage) {
    this.storage = storage;

    this.failureKey = "error";
    this.historyKey = "last_crawl";
  }

  // track errors
  async getAllErrors(type: string): Promise<ErrorDataKeyValue> {
    return this.storage.listRedisWithKeys(`${this.failureKey}:${type}:*`);
  }

  async getOneError(type: string, key: string): Promise<ErrorData> {
    return this.storage.getRedis(`${this.failureKey}:${type}:${key}`);
  }

  async upsertError(type: string, baseUrl: string, errorDetail: ErrorData) {
    if (!baseUrl) throw new Error("baseUrl is required");

    return this.storage.putRedisTTL(
      `${this.failureKey}:${type}:${baseUrl}`,
      errorDetail,
      RECORD_TTL_TIMES_SECONDS.ERROR
    );
  }

  // track last scans for instance and communities
  async getLastCrawl(
    type: string,
    baseUrl: string
  ): Promise<LastCrawlData | null> {
    const lastCrawlRecord = await this.storage.getRedis(
      `${this.historyKey}:${type}:${baseUrl}`
    );

    if (lastCrawlRecord) {
      if (lastCrawlRecord.time) {
        return lastCrawlRecord.time;
      }

      return lastCrawlRecord;
    }

    return null;
  }

  async listAllLastCrawl() {
    return this.storage.listRedisWithKeys(`${this.historyKey}:*`);
  }

  async setLastCrawl(type, baseUrl, data: any = {}) {
    if (!baseUrl) throw new Error("baseUrl is required");

    return this.storage.putRedisTTL(
      `${this.historyKey}:${type}:${baseUrl}`,
      { time: Date.now(), ...data },
      RECORD_TTL_TIMES_SECONDS.LAST_CRAWL
    );
  }
}
