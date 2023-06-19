// type FailureData = {
//   error: string;
//   stack: string;
//   isAxiosError: boolean;
//   time: number;
// };

export default class Failure {
  constructor(storage) {
    this.storage = storage;
  }

  async getAll(type) {
    return this.storage.listRedisWithKeys(`error:${type}:*`);
  }

  async getOne(type, key) {
    return this.storage.getRedis(`error:${type}:${key}`);
  }

  async upsert(type, baseUrl, errorDetail) {
    if (!baseUrl) throw new Error("baseUrl is required");
    return this.storage.putRedis(`error:${type}:${baseUrl}`, errorDetail);
  }
}
