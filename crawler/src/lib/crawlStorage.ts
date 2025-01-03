import { createClient, RedisClientType } from "redis";

import { REDIS_URL } from "./const";
import logging from "./logging";

// core
import InstanceStore from "./storage/instance";
import CommunityStore from "./storage/community";
import KBinStore from "./storage/kbin";

// supporting
import FediverseStore from "./storage/fediverse";
import UptimeStore from "./storage/uptime";
import FediseerStore from "./storage/fediseer";

// tracking
import TrackingStore from "./storage/tracking";

export class CrawlStorage {
  // it's public so that utils cleanup can use it to expire stuff
  public client: RedisClientType;

  private attributeMaxAge: number;

  public instance: InstanceStore;
  public community: CommunityStore;
  public uptime: UptimeStore;
  public fediverse: FediverseStore;
  public fediseer: FediseerStore;
  public tracking: TrackingStore;
  public kbin: KBinStore;

  constructor() {
    logging.debug("CrawlStorage Constructed", REDIS_URL);
    this.client = createClient({
      url: REDIS_URL,
    });

    this.attributeMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

    this.instance = new InstanceStore(this);
    this.community = new CommunityStore(this);
    this.uptime = new UptimeStore(this);
    this.fediverse = new FediverseStore(this);
    this.fediseer = new FediseerStore(this);
    this.tracking = new TrackingStore(this);
    this.kbin = new KBinStore(this);
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
      logging.info("CrawlStorage Opened", REDIS_URL);
    }
  }

  async close() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async putRedis(key: string, value: any): Promise<any> {
    return this.client.set(key, JSON.stringify(value));
  }

  async putRedisTTL(key: string, value: any, expireInSeconds: number): Promise<any> {
    await this.client.set(key, JSON.stringify(value));
    return this.client.expire(key, expireInSeconds);
  }

  async getRedis(key: string): Promise<any> {
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
  async listRedisWithKeys(key: string): Promise<{ [key: string]: any }> {
    const keys = await this.client.keys(key);
    const object = {};
    await Promise.all(
      keys.map(async (key) => {
        const json = await this.client.get(key);
        object[key] = json ? JSON.parse(json) : null;
      }),
    );
    return object;
  }

  // returns an array
  async listRedis(key: string): Promise<any[]> {
    const keys = await this.client.keys(key);
    return Promise.all(
      keys.map(async (key) => {
        const json = await this.client.get(key);
        return json ? JSON.parse(json) : null;
      }),
    );
  }

  async redisZAdd(key: string, score: number, value: string): Promise<any> {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    return this.client.zAdd(key, [{ score, value }]);
  }

  async deleteRedis(key: string): Promise<any> {
    return this.client.del(key);
  }

  async getAttributeArray(baseUrl: string, attributeName: string): Promise<any> {
    const start = Date.now() - this.attributeMaxAge;
    const end = Date.now();

    const keys = await this.client.zRangeByScore(
      `attributes:instance:${baseUrl}:${attributeName}`,
      start,
      end,
    );
    return keys;
  }

  async getAttributesWithScores(baseUrl: string, attributeName: string): Promise<any> {
    const start = Date.now() - this.attributeMaxAge;
    const end = Date.now();

    const keys = await this.client.zRangeByScoreWithScores(
      `attributes:instance:${baseUrl}:${attributeName}`,
      start,
      end,
    );
    return keys;
  }
}

const storage: CrawlStorage = new CrawlStorage();
export default storage;
