import { CrawlStorage } from "../crawlStorage";

import { RECORD_TTL_TIMES_SECONDS } from "../const";

export type IErrorData = {
  time: number;
  error: string;
  stack?: string;
  isAxiosError?: boolean;
  requestUrl?: string;
  code?: number;
  url?: string;
  duration?: number;
};

export type IErrorDataKeyValue = {
  [key: string]: IErrorData;
};

export type ILastCrawlData = {
  time: number;
  duration?: number;
  [key: string]: any;
};

export type ILastCrawlDataKeyValue = {
  [key: string]: ILastCrawlData;
};

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
  async getAllErrors(type: string): Promise<IErrorDataKeyValue> {
    return this.storage.listRedisWithKeys(`${this.failureKey}:${type}:*`);
  }

  async getOneError(type: string, key: string): Promise<IErrorData> {
    return this.storage.getRedis(`${this.failureKey}:${type}:${key}`);
  }

  async upsertError(type: string, baseUrl: string, errorDetail: IErrorData) {
    if (!baseUrl) throw new Error("baseUrl is required");

    return this.storage.putRedisTTL(
      `${this.failureKey}:${type}:${baseUrl}`,
      errorDetail,
      RECORD_TTL_TIMES_SECONDS.ERROR,
    );
  }

  // track last scans for instance and communities
  async getLastCrawl(type: string, baseUrl: string): Promise<ILastCrawlData> {
    return await this.storage.getRedis(`${this.historyKey}:${type}:${baseUrl}`);
  }

  async listAllLastCrawl(): Promise<ILastCrawlDataKeyValue> {
    return this.storage.listRedisWithKeys(`${this.historyKey}:*`);
  }

  async setLastCrawl(type: string, baseUrl: string, data: Partial<ILastCrawlData>) {
    if (!baseUrl) throw new Error("baseUrl is required");

    return this.storage.putRedisTTL(
      `${this.historyKey}:${type}:${baseUrl}`,
      { time: Date.now(), ...data },
      RECORD_TTL_TIMES_SECONDS.LAST_CRAWL,
    );
  }
}
