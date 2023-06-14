import redis from "redis";

import { REDIS_URL } from "./const.js";

const client = redis.createClient({
  url: REDIS_URL,
});

// set

export async function storeFediverseInstance(baseUrl, data) {
  await connectIfNeeded();
  return putRedis(`fediverse:${baseUrl}`, data);
}
export async function storeError(type, baseUrl, data) {
  await connectIfNeeded();
  return putRedis(`error:${type}:${baseUrl}`, data);
}
export async function putInstanceData(baseUrl, value) {
  await connectIfNeeded();
  return putRedis(`instance:${baseUrl}`, value);
}
export async function putCommunityData(baseUrl, data) {
  await connectIfNeeded();
  return putRedis(`community:${baseUrl}:${data.community.name}`, data);
}
export async function putUptimeData(data) {
  await connectIfNeeded();
  return putRedis(`uptime:${Date.now()}`, data);
}

// get

export async function getError(type, key) {
  await connectIfNeeded();
  return getRedis(`error:${type}:${key}`);
}
export async function getInstanceData(key) {
  await connectIfNeeded();
  return getRedis(`instance:${key}`);
}
export async function getCommunityData(key) {
  await connectIfNeeded();
  return getRedis(`community:${key}`);
}
export async function getFediverseData(baseUrl) {
  await connectIfNeeded();
  return getRedis(`fediverse:${baseUrl}`);
}
export async function getLatestUptimeData() {
  await connectIfNeeded();

  // records have uptime:timestamp key, extract the latest one
  const keys = await client.keys(`uptime:*`);
  const latestKey = keys.reduce((a, b) => (a > b ? a : b));
  return getRedis(latestKey);
}

// list

export async function listInstanceData() {
  await connectIfNeeded();
  return listRedis(`instance:*`);
}
export async function listCommunityData() {
  await connectIfNeeded();
  return listRedis(`community:*`);
}
export async function listFediverseData() {
  await connectIfNeeded();
  return listRedisWithKeys(`fediverse:*`);
}
export async function listFailureData(type) {
  await connectIfNeeded();
  return listRedisWithKeys(`error:${type}:*`);
}

// local

async function connectIfNeeded() {
  if (!client.isOpen) {
    await client.connect();
  }
}

async function putRedis(key, value) {
  return client.set(key, JSON.stringify(value));
}

async function getRedis(key) {
  const json = await client.get(key);
  return JSON.parse(json);
}

async function listRedisWithKeys(key) {
  const keys = await client.keys(key);
  const object = {};
  await Promise.all(
    keys.map(async (key) => {
      const keydata = await client.get(key);
      object[key] = JSON.parse(keydata);
    })
  );
  return object;
}

async function listRedis(key) {
  const keys = await client.keys(key);
  return Promise.all(
    keys.map(async (key) => {
      const json = await client.get(key);
      return JSON.parse(json);
    })
  );
}
