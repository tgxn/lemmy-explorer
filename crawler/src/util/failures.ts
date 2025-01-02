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

import crawlStorage from "../crawlStorage";

import { RECORD_TTL_TIMES_SECONDS } from "../lib/const";
import { getActorBaseUrl } from "../lib/validator";

// @TODO these should no longer be in the database to start with, not really required...
export default class FailureCrawl {
  constructor() {}

  async clean() {
    await this.cleanInstancesWithInvalidBaseUrl();
    await this.cleanCommunitiesWithInvalidBaseUrl();

    await this.addTTLToFailures();
    await this.addTTLToLastCrawl();
  }

  // add ttl to failures and last_crawl that dont have one already
  async addTTLToFailures() {
    const allErrors = await crawlStorage.tracking.getAllErrors("*");

    let keep = 0;
    let remove = 0;

    for (const [key, value] of Object.entries(allErrors)) {
      const normalTTL = RECORD_TTL_TIMES_SECONDS.ERROR * 1000;
      const shouldExpireAtMs = value.time + normalTTL;
      const ttlFromNowSeconds = Math.round(
        (shouldExpireAtMs - Date.now()) / 1000
      );

      // console.log(key, ttlFromNowSeconds, value.time);

      if (ttlFromNowSeconds < 0) {
        await crawlStorage.client.expire(key, 1);
        remove++;
      } else {
        await crawlStorage.client.expire(key, ttlFromNowSeconds);
        keep++;
      }
    }
    console.log("errors: update", keep, "remove", remove);
  }

  // add ttl to failures and last_crawl that dont have one already
  async addTTLToLastCrawl() {
    const allLastCrawl = await crawlStorage.tracking.listAllLastCrawl();

    let keep = 0;
    let remove = 0;

    for (const [key, value] of Object.entries(allLastCrawl)) {
      const normalTTL = RECORD_TTL_TIMES_SECONDS.LAST_CRAWL * 1000; // how old a record can exist for

      const shouldExpireAtMs = value + normalTTL;
      const ttlFromNowSeconds = Math.round(
        (shouldExpireAtMs - Date.now()) / 1000
      );

      if (ttlFromNowSeconds < 0) {
        await crawlStorage.client.expire(key, 1);
        remove++;
      } else {
        await crawlStorage.client.expire(key, ttlFromNowSeconds);
        keep++;
      }
    }
    console.log("last_crawl: keep", keep, "remove", remove);
  }

  isInstanceValid(baseUrl, actorId) {
    const actorBaseUrl = getActorBaseUrl(actorId);

    if (!actorBaseUrl) {
      console.error(baseUrl, "INVALID fail", actorId);
      return false;
    }

    if (actorBaseUrl !== baseUrl) {
      console.error(baseUrl, "match FAIL", `${actorBaseUrl} != ${baseUrl}`);
      return false;
    }

    return true;
  }

  // clean out any instances from the db that have non-matching baseurl and key, or if the actorid is invalid
  async cleanInstancesWithInvalidBaseUrl() {
    console.log("cleanInstancesWithInvalidBaseUrl");
    const keys = await crawlStorage.instance.getAllWithKeys();

    for (const [key, value] of Object.entries(keys)) {
      const keyBaseUrl = key.replace("instance:", "");

      const isValid = this.isInstanceValid(
        keyBaseUrl,
        value?.siteData?.site.actor_id
      );
      if (!isValid) {
        await crawlStorage.instance.delete(keyBaseUrl);
      }
    }
  }

  async isCommunityValid(keyBaseUrl, keyCommmunity, record) {
    const isInstanceValid = this.isInstanceValid(
      keyBaseUrl,
      record?.community?.actor_id
    );

    if (!isInstanceValid) {
      return false;
    }

    if (record.community.name.toLowerCase() != keyCommmunity) {
      console.error("MATCH NAME", keyCommmunity, record?.community.name);
      return false;
    }

    return true;
  }

  async cleanCommunitiesWithInvalidBaseUrl() {
    console.log("cleanCommunitiesWithInvalidBaseUrl");
    const keys = await crawlStorage.community.getAllWithKeys();

    for (const [key, value] of Object.entries(keys)) {
      const keyBaseUrl = key.split(":")[1];
      const keyCommmunity = key.split(":")[2];

      const isValid = this.isCommunityValid(keyBaseUrl, keyCommmunity, value);
      if (!isValid) {
        await crawlStorage.community.delete(keyBaseUrl, keyCommmunity);
        continue;
      }

      // check an instance exists for it=
      const instance = await crawlStorage.instance.getOne(keyBaseUrl);
      if (!instance) {
        console.error("instance not found", keyBaseUrl, keyCommmunity);
        await crawlStorage.community.delete(keyBaseUrl, keyCommmunity);
        continue;
      }
    }
  }

  async cleanInvalidInstances() {
    const keys = await crawlStorage.instance.getAll();

    //   console.log(keys);

    // for each key/value
    for (const [key, value] of Object.entries(keys)) {
      if (!value?.siteData?.site) {
        console.info("unknwn", key, value);

        // delete
        // await client.del(key);
      }
    }
  }
}
