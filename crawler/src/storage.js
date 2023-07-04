import logging from "./lib/logging.js";

import { createClient } from "redis";

import { REDIS_URL } from "./lib/const.js";

import InstanceStore from "./storage/instance.js";
import CommunityStore from "./storage/community.js";

import FediverseStore from "./storage/fediverse.js";
import KBinStore from "./storage/kbin.js";
import UptimeStore from "./storage/uptime.js";

import TrackingStore from "./storage/tracking.js";

class Storage {
  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });

    this.attributeMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

    this.instance = new InstanceStore(this);
    this.community = new CommunityStore(this);
    this.uptime = new UptimeStore(this);
    this.fediverse = new FediverseStore(this);

    this.tracking = new TrackingStore(this);
    this.kbin = new KBinStore(this);
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async close() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async putRedis(key, value) {
    return this.client.set(key, JSON.stringify(value));
  }

  async getRedis(key) {
    const json = await this.client.get(key);
    if (!json) return null;
    return JSON.parse(json);
  }

  /** {
   * returns mapped obejct, json parsed:
    `instance:${baseUrl}`: {
      nodeData: Object,
      siteData: Object,
      langs: Array<string>,
      lastCrawled: number,
    } */
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

  // returns an array
  async listRedis(key) {
    const keys = await this.client.keys(key);
    return Promise.all(
      keys.map(async (key) => {
        const json = await this.client.get(key);
        return json ? JSON.parse(json) : null;
      })
    );
  }

  async redisZAdd(key, score, value) {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    return this.client.zAdd(key, [{ score, value }]);
  }

  async deleteRedis(key) {
    return this.client.del(key);
  }

  async getAttributeArray(baseUrl, attributeName) {
    const start = Date.now() - this.attributeMaxAge;
    const end = Date.now();

    const keys = await this.client.zRangeByScore(
      `attributes:instance:${baseUrl}:${attributeName}`,
      start,
      end
    );
    return keys;
  }

  async getAttributesWithScores(baseUrl, attributeName) {
    const start = Date.now() - this.attributeMaxAge;
    const end = Date.now();

    const keys = await this.client.zRangeByScoreWithScores(
      `attributes:instance:${baseUrl}:${attributeName}`,
      start,
      end
    );
    return keys;
  }
}

const storage = new Storage();
export default storage;
