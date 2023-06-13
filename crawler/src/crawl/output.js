// this file generates the .json files for the frontend /public folder
// it conencts to redis and pulls lists of all the data we have stored

import { open } from "node:fs/promises";

import {
  listInstanceData,
  listCommunityData,
  listFediverseData,
} from "../lib/storage.js";

import { OUTPUT_MAX_AGE_MS } from "../lib/const.js";

export default class CrawlOutput {
  constructor() {
    this.storeData = [];
    this.storeCommunityData = [];
    this.storeFediverseData = [];
  }

  async start() {
    ///
    /// Lemmy Instances
    ///

    const instances = await listInstanceData();

    let storeData = instances.map((instance) => {
      return {
        url: instance.siteData.site.actor_id,
        name: instance.siteData.site.name,
        desc: instance.siteData.site.description,
        date: instance.siteData.site.published,
        version: instance.nodeData.software.version,
        open: instance.nodeData.openRegistrations,
        usage: instance.nodeData.usage,
        icon: instance.siteData.site.icon,
        banner: instance.siteData.site.banner,
        time: instance.lastCrawled || null,
      };
    });

    // remove instances not updated in 24h
    storeData = storeData.filter((instance) => {
      if (!instance.time) return false;

      // remove instances with age < OUTPUT_MAX_AGE_MS
      // console.log(Date.now() - instance.time, OUTPUT_MAX_AGE_MS);
      if (Date.now() - instance.time < OUTPUT_MAX_AGE_MS) {
        return true;
      }

      return false;
    });

    // filter blank
    storeData = storeData.filter(
      (instance) => instance.url !== "" || instance.name !== ""
    );

    console.log(`Instances ${instances.length} -> ${storeData.length}`);

    await this.writeJsonFile(
      "../frontend/public/instances.json",
      JSON.stringify(storeData)
    );

    ///
    /// Lemmy Communities
    ///

    const communities = await listCommunityData();

    let storeCommunityData = communities.map((community) => {
      return {
        url: community.community.actor_id,
        name: community.community.name,
        title: community.community.title,
        desc: community.community.description,
        icon: community.community.icon,
        banner: community.community.banner,
        nsfw: community.community.nsfw,
        counts: community.counts,
        time: community.lastCrawled,
      };
    });

    // remove communities not updated in 24h
    storeCommunityData = storeCommunityData.filter((community) => {
      if (!community.time) return false;

      // remove communities with age < OUTPUT_MAX_AGE_MS
      // console.log(Date.now() - community.time, OUTPUT_MAX_AGE_MS);
      if (Date.now() - community.time < OUTPUT_MAX_AGE_MS) {
        return true;
      }

      return false;
    });

    // filter blank
    storeCommunityData = storeCommunityData.filter(
      (community) =>
        community.url !== "" || community.name !== "" || community.title !== ""
    );

    console.log(
      `Communities ${communities.length} -> ${storeCommunityData.length}`
    );

    await this.writeJsonFile(
      "../frontend/public/communities.json",
      JSON.stringify(storeCommunityData)
    );

    ///
    /// Fediverse Servers
    ///

    const fediverseData = await listFediverseData();
    // console.log("Fediverse", fediverseData);

    let returnStats = [];
    let storeFediverseData = Object.keys(fediverseData).forEach((fediKey) => {
      const fediverseString = fediverseData[fediKey];
      // console.log("fediverseString", fediverseString);
      const baseUrl = fediKey.replace("fediverse:", "");
      // console.log("baseUrl", baseUrl);

      const fediverse = JSON.parse(fediverseString);
      // console.log("fediverse", fediverse);
      if (fediverse.name) {
        returnStats.push({
          url: baseUrl,
          software: fediverse.name,
          version: fediverse.version,
        });
      }
    });
    console.log("Fediverse Servers", returnStats.length);

    await this.writeJsonFile(
      "../frontend/public/fediverse.json",
      JSON.stringify(returnStats)
    );

    process.exit(0);
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
