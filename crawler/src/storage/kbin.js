export default class KBinStore {
  constructor(storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedis(`magazine:*`);
  }
  async getAllWithKeys() {
    return this.storage.listRedisWithKeys(`magazine:*`);
  }
  async getOne(baseUrl, magazineName) {
    return this.storage.getRedis(`magazine:${baseUrl}:${magazineName}`);
  }
  async upsert(baseUrl, magazine) {
    const storeData = {
      ...magazine,
      lastCrawled: Date.now(),
    };
    return this.storage.putRedis(
      `magazine:${baseUrl}:${magazine.name.toLowerCase()}`,
      storeData
    );
  }

  async delete(baseUrl, magazineName, reason = "unknown") {
    const oldRecord = await this.getOne(baseUrl, magazineName);
    await this.storage.putRedis(`deleted:magazine:${baseUrl}:${magazineName}`, {
      ...oldRecord,
      deletedAt: Date.now(),
      deleteReason: reason,
    });

    return this.storage.deleteRedis(`magazine:${baseUrl}:${magazineName}`);
  }

  // use these to track magazine attributes over time
  async setTrackedAttribute(
    baseUrl,
    magazineName,
    attributeName,
    attributeValue
  ) {
    return await this.storage.redisZAdd(
      `attributes:magazine:${baseUrl}:${magazineName}:${attributeName}`,
      Date.now(),
      attributeValue
    );
  }
}
