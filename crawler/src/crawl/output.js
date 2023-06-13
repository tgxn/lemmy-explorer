// this file generates the .json files for the frontend /public folder
// it conencts to redis and pulls lists of all the data we have stored

import { open } from "node:fs/promises";
import { readFile } from "node:fs/promises";

import {
  listInstanceData,
  listCommunityData,
  listFediverseData,
  listFailureData,
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

    let failureData = await listFailureData("instance");

    function findFail(baseUrl) {
      const keyName = `error:instance:${baseUrl}`;

      const value =
        failureData[Object.keys(failureData).find((k) => k === keyName)];

      if (value) {
        return value;
      }

      return null;
    }

    console.log(`Failures: ${Object.keys(failureData).length}`);
    console.log();

    const instances = await listInstanceData();

    let storeData = instances.map((instance) => {
      return {
        baseurl: instance.siteData.site.actor_id.split("/")[2],
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

    // remove those with errors that happened before time
    storeData = storeData.filter((instance) => {
      const fail = findFail(instance.baseurl);
      if (fail) {
        if (instance.time > fail.time) {
          // console.log("filtered due to fail", fail, instance.baseurl);
          return true;
        }
      }
      return false;
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
    console.log();

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
        baseurl: community.community.actor_id.split("/")[2],
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

    // remove those with errors that happened before updated time
    storeCommunityData = storeCommunityData.filter((community) => {
      const fail = findFail(community.baseurl);
      if (fail) {
        if (community.time > fail.time) {
          // console.log("filtered due to fail", fail, instance.baseurl);
          return true;
        }
      }
      return false;
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
    console.log();

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
      const fediverse = fediverseData[fediKey];
      // console.log("fediverseString", fediverseString);
      const baseUrl = fediKey.replace("fediverse:", "");
      // console.log("baseUrl", baseUrl);

      // const fediverse = JSON.parse(fediverseString);
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

    // generate overview metrics and stats
    const metrics = {
      instances: storeData.length,
      communities: storeCommunityData.length,
    };

    await this.writeJsonFile(
      "../frontend/public/overview.json",
      JSON.stringify(metrics)
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
