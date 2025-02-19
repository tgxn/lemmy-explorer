import { CrawlStorage } from "../crawlStorage";

import { IInstanceData, IInstanceDataKeyValue } from "../../../../types/storage";

/**
 * Stores each lemmy instance, keyed on baseUrl as `instance:baseUrl`.
 *
 * Each instance is stored as a JSON object with the following fields:
 */

export default class Instance {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getAll(): Promise<IInstanceData[]> {
    return this.storage.listRedis(`instance:*`);
  }

  async getAllWithKeys(): Promise<IInstanceDataKeyValue> {
    return this.storage.listRedisWithKeys(`instance:*`);
  }

  async getOne(key: string): Promise<IInstanceData> {
    return this.storage.getRedis(`instance:${key}`);
  }

  async upsert(baseUrl: string, value: IInstanceData) {
    return this.storage.putRedis(`instance:${baseUrl}`, value);
  }

  async delete(key: string) {
    return this.storage.deleteRedis(`instance:${key}`);
  }

  // use these to track instance attributes over time
  async setTrackedAttribute(baseUrl: string, attributeName: string, attributeValue: string) {
    await this.storage.redisZAdd(
      `attributes:instance:${baseUrl}:${attributeName}`,
      Date.now(),
      attributeValue,
    );
  }

  async getAttributeArray(baseUrl: string, attributeName: string) {
    const keys = await this.storage.getAttributeArray(baseUrl, attributeName);

    return keys;
  }

  async getAttributeWithScores(baseUrl: string, attributeName: string) {
    const keys = await this.storage.getAttributesWithScores(baseUrl, attributeName);

    return keys;
  }
}
