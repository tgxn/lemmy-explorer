import { RedisClientType } from "redis";

declare class RedisStorage {
  public client: RedisClientType;

  attributeMaxAge: number;
  instance: any;
  community: any;
  uptime: any;
  fediverse: any;
  tracking: any;
  kbin: any;

  constructor();

  connect(): Promise<void>;
  close(): Promise<void>;

  // data is serialized to JSON with `JSON.stringify` before being stored
  putRedis(key: string, value: any): Promise<void>;
  putRedisTTL(key: string, value: any, expireInSeconds: number): Promise<void>;

  // returns a single stored object, json parsed
  getRedis(key: string): Promise<any | null>;

  // returns an array of stored objects, json parsed
  listRedis(key: string): Promise<string[]>;

  // returns a key-> value mapping of stored objects, json parsed
  listRedisWithKeys(key: string): Promise<{ key: string; value: string }[]>;

  // add a scored set to db
  redisZAdd(key: string, score: number, value: any): Promise<void>;

  deleteRedis(key: string): Promise<void>;

  getAttributeArray(baseUrl: string, attributeName: string): Promise<string[]>;

  getAttributesWithScores(
    baseUrl: string,
    attributeName: string
  ): Promise<{ value: string; score: number }[]>;
}

export = RedisStorage;
