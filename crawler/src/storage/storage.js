import { createClient } from "redis";

import { REDIS_URL } from "../lib/const.js";

/**
 * LastScan
 *  store the last time we scanned this thing instance/community/fediverse
 *
 * Failure
 *  store the last time we failed to scan this thing instance/community/fediverse
 *
 * Instance
 *  store list of instances on baseurl
 *
 *
 *
 */

class Storage {
  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });
  }

  close() {
    this.client.quit();
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    this.instance = new Instance(this);
    this.failure = new Failure(this);
    this.community = new Community(this);
    this.uptime = new Uptime(this);
    this.fediverse = new Fediverse(this);
  }

  async putRedis(key, value) {
    return this.client.set(key, JSON.stringify(value));
  }

  async getRedis(key) {
    const json = await this.client.get(key);
    if (!json) return null;
    return JSON.parse(json);
  }

  async listRedisWithKeys(key) {
    const keys = await this.client.keys(key);
    const object = {};
    await Promise.all(
      keys.map(async (key) => {
        const json = await this.client.get(key);
        object[key] = json ? JSON.parse(json) : null;
      })
    );
    return object;
  }

  async listRedis(key) {
    const keys = await this.client.keys(key);
    return Promise.all(
      keys.map(async (key) => {
        const json = await this.client.get(key);
        return json ? JSON.parse(json) : null;
      })
    );
  }
}
const storage = new Storage();
export default storage;

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

class Instance {
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

// type FailureData = {
//   error: string;
//   stack: string;
//   isAxiosError: boolean;
//   time: number;
// };

class Failure {
  constructor(storage) {
    this.storage = storage;
  }
  async getAll(type) {
    return this.storage.listRedisWithKeys(`error:${type}:*`);
  }
  async getOne(type, key) {
    return this.storage.getRedis(`error:${type}:${key}`);
  }
  async upsert(type, baseUrl, data) {
    if (!baseUrl) throw new Error("baseUrl is required");
    return this.storage.putRedis(`error:${type}:${baseUrl}`, data);
  }
}

// type CommunityData = {
//   community: {
//     id: number;
//     name: string;
//     title: string;
//     description: string;
//     removed: boolean;
//     published: string;
//     updated: string | null;
//     deleted: boolean;
//     nsfw: boolean;
//     actor_id: string;
//     local: boolean;
//     icon: string | null;
//     banner: string | null;
//     hidden: boolean;
//     posting_restricted_to_mods: boolean;
//     instance_id: number;
//   };
//   subscribed: string;
//   blocked: boolean;
//   counts: Object;
//   lastCrawled: number;
// };

class Community {
  constructor(storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedis(`community:*`);
  }
  async getOne(key) {
    return this.storage.getRedis(`community:${key}`);
  }
  async upsert(baseUrl, data) {
    return this.storage.putRedis(
      `community:${baseUrl}:${data.community.name.toLowerCase()}`,
      data
    );
  }
}

class Uptime {
  constructor(storage) {
    this.storage = storage;
  }

  async getLatest() {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`uptime:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }
  async addNew(data) {
    return this.storage.putRedis(`uptime:${Date.now()}`, data);
  }
}

// type FediverseData = {
//   name: string;
//   version: string;
// };

class Fediverse {
  constructor(storage) {
    this.storage = storage;
  }

  async getAll() {
    return this.storage.listRedisWithKeys(`fediverse:*`);
  }
  async getOne(baseUrl) {
    return this.storage.getRedis(`fediverse:${baseUrl}`);
  }
  async upsert(baseUrl, data) {
    const dd = { time: Date.now(), ...data };
    return this.storage.putRedis(`fediverse:${baseUrl}`, dd);
  }
}
