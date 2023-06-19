/**
 * should recrawl failed jobs and decide what to do with them
 *
 * instances
 *  - if the instance is down, we should remove it from the db
 *  - if the instance is up, we should recrawl it
 *
 * communities
 *  check when instance was last crawled
 *   if it was crawled recently, we should recrawl it
 *
 *
 *
 */

class FailureCrawl {}

// for testing invalid entries...
import redis from "redis";

import { REDIS_URL } from "./src/lib/const.js";

const client = redis.createClient({
  url: REDIS_URL,
});

async function connectIfNeeded() {
  if (!client.isOpen) {
    await client.connect();
  }
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

async function main() {
  await connectIfNeeded();

  const keys = await listRedisWithKeys("instance:*");

  //   console.log(keys);

  // for each key/value
  for (const [key, value] of Object.entries(keys)) {
    if (!value?.siteData?.site) {
      console.info("unknwn", key, value);

      // delete
      await client.del(key);
    }

    // do something with the key/value
    // console.log(key);
  }
}

main();
