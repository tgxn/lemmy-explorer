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

import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import type { BaseURL, ActorID } from "../../../types/basic";
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
    const allErrors = await storage.tracking.getAllErrors("*");

    let keep = 0;
    let remove = 0;

    for (const [key, value] of Object.entries(allErrors)) {
      const normalTTL = RECORD_TTL_TIMES_SECONDS.ERROR * 1000;
      const shouldExpireAtMs = value.time + normalTTL;
      const ttlFromNowSeconds = Math.round((shouldExpireAtMs - Date.now()) / 1000);

      // console.log(key, ttlFromNowSeconds, value.time);

      if (ttlFromNowSeconds < 0) {
        await storage.client.expire(key, 1);
        remove++;
      } else {
        await storage.client.expire(key, ttlFromNowSeconds);
        keep++;
      }
    }
    logging.debug("errors: update", keep, "remove", remove);
  }

  // add ttl to failures and last_crawl that dont have one already
  async addTTLToLastCrawl() {
    const allLastCrawl = await storage.tracking.listAllLastCrawl();

    let keep = 0;
    let remove = 0;

    for (const [key, value] of Object.entries(allLastCrawl)) {
      const normalTTL = RECORD_TTL_TIMES_SECONDS.LAST_CRAWL * 1000; // how old a record can exist for

      const recordTime = value.time;
      const shouldExpireAtMs = recordTime + normalTTL;

      const ttlFromNowSeconds = Math.round((shouldExpireAtMs - Date.now()) / 1000);

      if (ttlFromNowSeconds < 0) {
        await storage.client.expire(key, 1);
        remove++;
      } else {
        await storage.client.expire(key, ttlFromNowSeconds);
        keep++;
      }
    }
    logging.debug("last_crawl: keep", keep, "remove", remove);
  }

  isInstanceValid(baseUrl: BaseURL, actorId: ActorID) {
    const actorBaseUrl = getActorBaseUrl(actorId);
    if (!actorBaseUrl) {
      logging.error(baseUrl, "INVALID fail", actorId);
      return false;
    }

    if (actorBaseUrl !== baseUrl) {
      logging.error(baseUrl, "match FAIL", `${actorBaseUrl} != ${baseUrl}`);
      return false;
    }

    return true;
  }

  // clean out any instances from the db that have non-matching baseurl and key, or if the actorid is invalid
  async cleanInstancesWithInvalidBaseUrl() {
    logging.debug("cleanInstancesWithInvalidBaseUrl");
    const keys = await storage.instance.getAllWithKeys();

    for (const [key, value] of Object.entries(keys)) {
      const keyBaseUrl = key.replace("instance:", "");

      const isValid = this.isInstanceValid(keyBaseUrl, value?.siteData?.site.actor_id);
      if (!isValid) {
        await storage.instance.delete(keyBaseUrl);
      }
    }
  }

  async isCommunityValid(keyBaseUrl, keyCommmunity, record) {
    const isInstanceValid = this.isInstanceValid(keyBaseUrl, record?.community?.actor_id);

    if (!isInstanceValid) {
      return false;
    }

    if (record.community.name.toLowerCase() != keyCommmunity) {
      logging.error("MATCH NAME", keyCommmunity, record?.community.name);
      return false;
    }

    return true;
  }

  async cleanCommunitiesWithInvalidBaseUrl() {
    logging.debug("cleanCommunitiesWithInvalidBaseUrl");
    const keys = await storage.community.getAllWithKeys();

    for (const [key, value] of Object.entries(keys)) {
      const keyBaseUrl = key.split(":")[1];
      const keyCommmunity = key.split(":")[2];

      const isValid = this.isCommunityValid(keyBaseUrl, keyCommmunity, value);
      if (!isValid) {
        await storage.community.delete(keyBaseUrl, keyCommmunity);
        continue;
      }

      // check an instance exists for it=
      const instance = await storage.instance.getOne(keyBaseUrl);
      if (!instance) {
        logging.error("instance not found", keyBaseUrl, keyCommmunity);
        await storage.community.delete(keyBaseUrl, keyCommmunity);
        continue;
      }
    }
  }

  async cleanInvalidInstances() {
    const keys = await storage.instance.getAll();

    //   console.log(keys);

    // for each key/value
    for (const [key, value] of Object.entries(keys)) {
      if (!value?.siteData?.site) {
        logging.warn("unknwn", key, value);

        // delete
        // await client.del(key);
      }
    }
  }
}
