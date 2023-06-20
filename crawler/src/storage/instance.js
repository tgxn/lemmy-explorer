/**
 * Stores each lemmy instance, keyed on baseUrl as `instance:baseUrl`.
 *
 * Each instance is stored as a JSON object with the following fields:
 */

// type InstanceData = {
//   nodeData: Object;
//   siteData: Object;
//   langs: Array<string>;
//   lastCrawled: number;
// };

export default class Instance {
  constructor(storage) {
    this.storage = storage;
  }
  async getAll() {
    return this.storage.listRedis(`instance:*`);
  }
  async getAllWithKeys() {
    return this.storage.listRedisWithKeys(`instance:*`);
  }
  async getOne(key) {
    return this.storage.getRedis(`instance:${key}`);
  }
  async upsert(baseUrl, value) {
    return this.storage.putRedis(`instance:${baseUrl}`, value);
  }
  async delete(key) {
    return this.storage.deleteRedis(`instance:${key}`);
  }

  // use these to track instance attributes over time
  async setTrackedAttribute(baseUrl, attributeName, attributeValue) {
    await this.storage.redisZAdd(
      `attributes:instance:${baseUrl}:${attributeName}`,
      Date.now(),
      attributeValue
    );
  }

  async getAttributeArray(baseUrl, attributeName) {
    // return client.hgetall(`attributes:instance:${baseUrl}:${attributeName}`);

    const start = 0;
    const end = Date.now();

    return this.storage.client.zrangebyscore(
      `attributes:instance:${baseUrl}:${attributeName}`,
      start,
      end
    );

    // return new Promise((resolve, reject) => {
    //   client.zrangebyscore(
    //     `${sensorId}:${attribute}`,
    //     start,
    //     end,
    //     (err, data) => {
    //       if (err) reject(err);
    //       resolve(data);
    //     }
    //   );
    // });
  }
}
