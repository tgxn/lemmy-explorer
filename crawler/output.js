import { open } from "node:fs/promises";

import {
  putInstanceData,
  putCommunityData,
  getInstanceData,
  getCommunityData,
  listInstanceData,
  listCommunityData,
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

  const instances = await listInstanceData();
  console.log("Instances", instances.length);

  const storeData = instances.map((instanceString) => {
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

  await writeJsonFile(
    "../frontend/public/instances.json",
    JSON.stringify(storeData)
  );

  const communities = await listCommunityData();
  console.log("Communities", communities.length);

  const storeCommunityData = communities.map((communityString) => {
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

  await writeJsonFile(
    "../frontend/public/communities.json",
    JSON.stringify(storeCommunityData)
  );

  return true;
}

start();
