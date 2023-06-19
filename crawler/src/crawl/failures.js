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

import storage from "../storage.js";

import { getActorBaseUrl } from "../lib/validator.js";

export default class FailureCrawl {
  constructor() {}

  async clean() {
    await this.cleanInstancesWithInvalidBaseUrl();
    await this.cleanCommunitiesWithInvalidBaseUrl();
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
    const keys = await storage.instance.getAllWithKeys();

    for (const [key, value] of Object.entries(keys)) {
      const keyBaseUrl = key.replace("instance:", "");

      const isValid = this.isInstanceValid(
        keyBaseUrl,
        value?.siteData?.site.actor_id
      );
      if (!isValid) {
        await storage.instance.delete(keyBaseUrl);
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
        console.error("instance not found", keyBaseUrl, keyCommmunity);
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
        console.info("unknwn", key, value);

        // delete
        // await client.del(key);
      }
    }
  }
}
