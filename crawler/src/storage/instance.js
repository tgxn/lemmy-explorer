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
  async getOne(key) {
    return this.storage.getRedis(`instance:${key}`);
  }
  async upsert(baseUrl, value) {
    return this.storage.putRedis(`instance:${baseUrl}`, value);
  }
}
