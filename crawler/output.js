import { open } from "node:fs/promises";

import {
  putInstanceData,
  putCommunityData,
  getInstanceData,
  getCommunityData,
  listInstanceData,
  listCommunityData,
  listFediverseData,
} from "./storage.js";

async function writeJsonFile(filename, data) {
  let filehandle = null;
  try {
    filehandle = await open(filename, "w");
    await filehandle.writeFile(data);
  } finally {
    await filehandle?.close();
  }
}

async function start() {
  console.log("Generate JSON");

  ///
  /// Lemmy Instances
  ///

  const instances = await listInstanceData();
  console.log("Instances", instances.length);

  let storeData = instances.map((instanceString) => {
    const instance = JSON.parse(instanceString);
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
    };
  });

  // filter blank
  storeData = storeData.filter(
    (instance) => instance.url !== "" || instance.name !== ""
  );

  await writeJsonFile(
    "../frontend/public/instances.json",
    JSON.stringify(storeData)
  );

  ///
  /// Lemmy Communities
  ///

  const communities = await listCommunityData();
  console.log("Communities", communities.length);

  let storeCommunityData = communities.map((communityString) => {
    const community = JSON.parse(communityString);
    return {
      url: community.community.actor_id,
      name: community.community.name,
      title: community.community.title,
      desc: community.community.description,
      icon: community.community.icon,
      banner: community.community.banner,
      nsfw: community.community.nsfw,
      counts: community.counts,
    };
  });

  // filter blank
  storeCommunityData = storeCommunityData.filter(
    (instance) =>
      instance.url !== "" || instance.name !== "" || instance.title !== ""
  );

  await writeJsonFile(
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

  await writeJsonFile(
    "../frontend/public/fediverse.json",
    JSON.stringify(returnStats)
  );

  process.exit(0);
}

start();
