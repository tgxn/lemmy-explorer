import logging from "../lib/logging.js";
// this file generates the .json files for the frontend /public folder
// it conencts to redis and pulls lists of all the data we have stored

import { open } from "node:fs/promises";
import { readFile } from "node:fs/promises";

import removeMd from "remove-markdown";

import storage from "../storage.js";

import { OUTPUT_MAX_AGE_MS } from "../lib/const.js";

export default class CrawlOutput {
  constructor() {
    this.uptimeData = null;
    this.instanceErrors = null;
    this.communityErrors = null;
    this.instanceList = null;
    this.communityList = null;
  }

  async loadAllData() {
    this.uptimeData = await storage.uptime.getLatest();
    this.instanceErrors = await storage.tracking.getAllErrors("instance");
    this.communityErrors = await storage.tracking.getAllErrors("community");
    this.instanceList = await storage.instance.getAll();
    this.communityList = await storage.community.getAll();
  }

  /// find updatenode for given baseurl
  getBaseUrlUptime(baseUrl) {
    const foundKey = this.uptimeData.nodes.find((k) => k.domain == baseUrl);
    return foundKey;
  }

  // find a failure for a given baseurl
  findFail(baseUrl) {
    const keyName = `error:instance:${baseUrl}`;

    const value =
      this.instanceErrors[
        Object.keys(this.instanceErrors).find((k) => k === keyName)
      ];

    if (value) {
      return value;
    }

    return null;
  }

  stripMarkdown(text) {
    // strip markdown
    return removeMd(text);
  }

  // given an array, get a d-duped list of all the baseurls, returns three arrays with counts for each
  getFederationLists(instances) {
    // count instances by list
    let linkedFederation = {};
    let allowedFederation = {};
    let blockedFederation = {};

    function dedupAddItem(list, baseUrl) {
      // only add strings
      if (typeof baseUrl !== "string") {
        return;
      }

      if (!list[baseUrl]) {
        list[baseUrl] = 1;
      } else {
        list[baseUrl]++;
      }
    }

    // start crawler jobs for all of the instances this one is federated with
    instances.forEach((instance) => {
      if (!instance.siteData?.federated) {
        // logging.debug("no federated data", instance.siteData.site.actor_id);
        return;
      }

      const { linked, allowed, blocked } = instance.siteData.federated;

      logging.silly(
        `federated instances: ${instance.siteData.site.actor_id}`,
        instance.siteData.federated.linked.length
      );

      if (linked.length > 0) {
        for (const baseUrl of linked) {
          dedupAddItem(linkedFederation, baseUrl);
        }
      }
      if (allowed && allowed.length > 0) {
        for (const baseUrl of allowed) {
          dedupAddItem(allowedFederation, baseUrl);
        }
      }
      if (blocked && blocked.length > 0) {
        for (const baseUrl of blocked) {
          dedupAddItem(blockedFederation, baseUrl);
        }
      }
    });

    logging.info(
      `Federation Linked: ${Object.keys(linkedFederation).length} Allowed: ${
        Object.keys(allowedFederation).length
      } Blocked: ${Object.keys(blockedFederation).length}`
    );
    return [linkedFederation, allowedFederation, blockedFederation];
  }

  findErrorType(errorMessage) {
    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("EAI_AGAIN") ||
      errorMessage.includes("socket hang up") ||
      errorMessage.includes("Client network socket disconnected")
    ) {
      return "connectException";
    }

    if (errorMessage.includes("timeout of")) {
      return "timeout";
    }

    if (
      errorMessage.includes("self-signed certificate") ||
      errorMessage.includes("does not match certificate's altnames") ||
      errorMessage.includes("tlsv1 unrecognized name") ||
      errorMessage.includes("tlsv1 alert internal error") ||
      errorMessage.includes("ssl3_get_record:wrong version number") ||
      errorMessage.includes("unable to verify the first certificate") ||
      errorMessage.includes("unable to get local issuer certificate") ||
      errorMessage.includes("certificate has expired")
    ) {
      return "sslException";
    }

    if (errorMessage.includes("baseUrl is not a valid domain")) {
      return "invalidBaseUrl";
    }

    if (
      errorMessage.includes("code 300") ||
      errorMessage.includes("code 400") ||
      errorMessage.includes("code 403") ||
      errorMessage.includes("code 404") ||
      errorMessage.includes("code 406") ||
      errorMessage.includes("code 410") ||
      errorMessage.includes("code 500") ||
      errorMessage.includes("code 502") ||
      errorMessage.includes("code 503") ||
      errorMessage.includes("code 520") ||
      errorMessage.includes("code 521") ||
      errorMessage.includes("code 523") ||
      errorMessage.includes("code 525") ||
      errorMessage.includes("code 526") ||
      errorMessage.includes("code 530") ||
      errorMessage.includes("Maximum number of redirects exceeded")
    ) {
      return "httpException";
    }

    if (
      errorMessage.includes("no diaspora rel in") ||
      errorMessage.includes("wellKnownInfo.data.links is not iterable") ||
      errorMessage.includes("missing /.well-known/nodeinfo links")
    ) {
      return "httpException";
    }

    if (errorMessage.includes("not a lemmy instance")) {
      return "notLemmy";
    }

    if (
      errorMessage.includes("invalid actor id") ||
      errorMessage.includes("actor id does not match instance domain")
    ) {
      return "invalidActorId";
    }

    logging.silly("unhandled error", errorMessage);
  }

  async start() {
    await this.loadAllData();

    logging.info(`Uptime: ${this.uptimeData.nodes.length}`);
    logging.info(`Failures: ${Object.keys(this.instanceErrors).length}`);

    const [linkedFederation, allowedFederation, blockedFederation] =
      this.getFederationLists(this.instanceList);

    let storeData = this.instanceList.map((instance) => {
      if (!instance.siteData?.site?.actor_id) {
        logging.error("no actor_id", instance);
        return null;
      }
      let siteBaseUrl = instance.siteData.site.actor_id.split("/")[2];

      const siteUptime = this.getBaseUrlUptime(siteBaseUrl);

      const incomingBlocks = blockedFederation[siteBaseUrl] || 0;
      const outgoingBlocks = instance.siteData.federated?.blocked?.length || 0;

      let score = 0;
      // having a linked instance gives you a point for each link
      if (linkedFederation[siteBaseUrl]) {
        score += linkedFederation[siteBaseUrl];
      }

      // each allowed instance gives you points
      if (allowedFederation[siteBaseUrl]) {
        score += allowedFederation[siteBaseUrl] * 2;
      }

      // each blocked instance takes away points
      if (blockedFederation[siteBaseUrl]) {
        score -= blockedFederation[siteBaseUrl] * 10;
      }

      return {
        baseurl: siteBaseUrl,
        url: instance.siteData.site.actor_id,
        name: instance.siteData.site.name,
        desc: this.stripMarkdown(instance.siteData.site.description),

        // config
        downvotes: instance.siteData.config?.enable_downvotes,
        nsfw: instance.siteData.config?.enable_nsfw,
        create_admin: instance.siteData.config?.community_creation_admin_only,
        private: instance.siteData.config?.private_instance,
        fed: instance.siteData.config?.federation_enabled,

        date: instance.siteData.site.published,
        version: instance.nodeData.software.version,
        open: instance.nodeData.openRegistrations,

        usage: instance.nodeData.usage, // TO BE DEPRECATED
        counts: instance.siteData.counts, // USE THIS INSTEAD

        icon: instance.siteData.site.icon,
        banner: instance.siteData.site.banner,
        langs: instance.langs,

        time: instance.lastCrawled || null,
        score: score,
        uptime: siteUptime,

        blocks: {
          incoming: incomingBlocks,
          outgoing: outgoingBlocks,
        },
      };
    });

    // remove those with errors that happened before time
    storeData = storeData.filter((instance) => {
      if (instance == null) return false; // take out skipped

      const fail = this.findFail(instance.baseurl);
      if (fail) {
        if (instance.time < fail.time) {
          // logging.info("filtered due to fail", instance.baseurl, fail.error);
          return false;
        }
      }
      return true;
    });

    // remove instances not updated in 24h
    storeData = storeData.filter((instance) => {
      if (!instance.time) return false; // record needs time

      // remove communities with age more than the max
      const recordAge = Date.now() - instance.time;
      if (recordAge > OUTPUT_MAX_AGE_MS) {
        return false;
      }

      return true;
    });

    // filter blank
    storeData = storeData.filter(
      (instance) => instance.url !== "" || instance.name !== ""
    );

    logging.info(
      `Instances ${this.instanceList.length} -> ${storeData.length}`
    );

    await this.writeJsonFile(
      "../frontend/public/instances.json",
      JSON.stringify(storeData)
    );

    ///
    /// Lemmy Communities
    ///

    const communities = await storage.community.getAll();

    let storeCommunityData = communities.map((community) => {
      let siteBaseUrl = community.community.actor_id.split("/")[2];

      let score = 0;
      // having a linked instance gives you a point for each link
      if (linkedFederation[siteBaseUrl]) {
        score += linkedFederation[siteBaseUrl];
      }

      // each allowed instance gives you points
      if (allowedFederation[siteBaseUrl]) {
        score += allowedFederation[siteBaseUrl] * 2;
      }

      // each blocked instance takes away points
      if (blockedFederation[siteBaseUrl]) {
        score -= blockedFederation[siteBaseUrl] * 10;
      }

      // also score based subscribers
      score = score * community.counts.subscribers;

      return {
        baseurl: siteBaseUrl,
        url: community.community.actor_id,
        name: community.community.name,
        title: community.community.title,
        desc: this.stripMarkdown(community.community.description).substring(
          0,
          350
        ),
        icon: community.community.icon,
        banner: community.community.banner,
        nsfw: community.community.nsfw,
        counts: community.counts,
        time: community.lastCrawled || null,
        score: score,
      };
    });

    // remove those with errors that happened before updated time
    storeCommunityData = storeCommunityData.filter((community) => {
      const fail = this.findFail(community.baseurl);
      if (fail) {
        if (community.time < fail.time) {
          // logging.info("filtered due to fail", fail, instance.baseurl);
          return false;
        }
      }
      return true;
    });

    // remove communities not updated in 24h
    storeCommunityData = storeCommunityData.filter((community) => {
      if (!community.time) return false; // record needs time

      // remove communities with age more than the max
      const recordAge = Date.now() - community.time;
      if (recordAge > OUTPUT_MAX_AGE_MS) {
        return false;
      }

      return true;
    });

    // filter blank
    storeCommunityData = storeCommunityData.filter(
      (community) =>
        community.url !== "" || community.name !== "" || community.title !== ""
    );

    logging.info(
      `Communities ${communities.length} -> ${storeCommunityData.length}`
    );

    await this.writeJsonFile(
      "../frontend/public/communities.json",
      JSON.stringify(storeCommunityData)
    );

    ///
    /// Fediverse Servers
    ///

    const fediverseData = await storage.fediverse.getAll();
    // logging.info("Fediverse", fediverseData);

    let returnStats = [];
    let storeFediverseData = Object.keys(fediverseData).forEach((fediKey) => {
      const fediverse = fediverseData[fediKey];
      // logging.info("fediverseString", fediverseString);
      const baseUrl = fediKey.replace("fediverse:", "");
      // logging.info("baseUrl", baseUrl);

      // const fediverse = JSON.parse(fediverseString);
      // logging.info("fediverse", fediverse);
      if (fediverse.name) {
        returnStats.push({
          url: baseUrl,
          software: fediverse.name,
          version: fediverse.version,
        });
      }
    });
    logging.info("Fediverse Servers", returnStats.length);

    await this.writeJsonFile(
      "../frontend/public/fediverse.json",
      JSON.stringify(returnStats)
    );

    const packageJson = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url))
    );

    const metaData = {
      instances: storeData.length,
      communities: storeCommunityData.length,
      fediverse: returnStats.length,
      time: Date.now(),
      package: packageJson.name,
      version: packageJson.version,
    };
    await this.writeJsonFile(
      "../frontend/public/meta.json",
      JSON.stringify(metaData)
    );

    let instanceErrors = [];

    // key value in errors
    let errorTypes = {};
    for (const [key, value] of Object.entries(this.instanceErrors)) {
      if (value.time < Date.now() - OUTPUT_MAX_AGE_MS) {
        continue;
      }

      const instanceData = {
        baseurl: key,
        error: value.error,
        time: value.time,
      };
      instanceData.type = this.findErrorType(value.error);

      if (errorTypes[instanceData.type] === undefined) {
        errorTypes[instanceData.type] = 0;
      } else {
        errorTypes[instanceData.type]++;
      }

      instanceErrors.push(instanceData);
    }

    // count each type
    // let errorTypes = {};
    // instanceErrors.forEach((instance) => {
    //   console.log("instance", instance);
    //   if (!errorTypes[instance.type]) {
    //     errorTypes[instance.type] = 0;
    //   } else {
    //     errorTypes[instance.type]++;
    //   }
    // });

    logging.info("instanceErrors", instanceErrors.length, errorTypes);

    await this.writeJsonFile(
      "../frontend/public/instanceErrors.json",
      JSON.stringify(instanceErrors)
    );

    // generate overview metrics and stats
    const metrics = {
      instances: storeData.length,
      communities: storeCommunityData.length,

      // top 10 linked, allowed, blocked domains
      // sort by count of times seen on each list
      linked: linkedFederation,
      allowed: allowedFederation,
      blocked: blockedFederation,

      // federation instance software/version
    };

    await this.writeJsonFile(
      "../frontend/public/overview.json",
      JSON.stringify(metrics)
    );

    return true;
  }

  async writeJsonFile(filename, data) {
    let filehandle = null;
    try {
      filehandle = await open(filename, "w");
      await filehandle.writeFile(data);
    } finally {
      await filehandle?.close();
    }
  }
}
