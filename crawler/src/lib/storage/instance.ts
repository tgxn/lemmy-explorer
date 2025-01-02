import { CrawlStorage } from "../crawlStorage";

/**
 * Stores each lemmy instance, keyed on baseUrl as `instance:baseUrl`.
 *
 * Each instance is stored as a JSON object with the following fields:
 */

export type InstanceData = {
  nodeData: any;
  siteData: any;
  headers: any;
  langs: Array<string>;
  lastCrawled: number;
};

export type InstanceDataKeyValue = {
  [key: string]: InstanceData;
};

export default class Instance {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<InstanceData[]> {
    return this.storage.listRedis(`instance:*`);
  }

  async getAllWithKeys(): Promise<InstanceDataKeyValue> {
    return this.storage.listRedisWithKeys(`instance:*`);
  }

  async getOne(key: string): Promise<InstanceData> {
    return this.storage.getRedis(`instance:${key}`);
  }

  async upsert(baseUrl: string, value: InstanceData) {
    return this.storage.putRedis(`instance:${baseUrl}`, value);
  }

  async delete(key: string) {
    return this.storage.deleteRedis(`instance:${key}`);
  }

  // use these to track instance attributes over time
  async setTrackedAttribute(
    baseUrl: string,
    attributeName: string,
    attributeValue: string
  ) {
    await this.storage.redisZAdd(
      `attributes:instance:${baseUrl}:${attributeName}`,
      Date.now(),
      attributeValue
    );
  }

  async getAttributeArray(baseUrl: string, attributeName: string) {
    const keys = await this.storage.getAttributeArray(baseUrl, attributeName);

    return keys;
  }

  async getAttributeWithScores(baseUrl: string, attributeName: string) {
    const keys = await this.storage.getAttributesWithScores(
      baseUrl,
      attributeName
    );

    return keys;
  }
}
