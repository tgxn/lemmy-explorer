import axios from "axios";
import Queue from "bee-queue";

import {
  putInstanceData,
  storeUnknownInstance,
  storeOtherError,
  putCommunityData,
  getInstanceData,
  getCommunityData,
  listInstanceData,
  listCommunityData,
} from "../storage.js";

import { createCommunityCrawlJob, runCommunityCrawl } from "./communities.js";

const options = {
  removeOnSuccess: true,
};
const instanceQueue = new Queue("instances", options);

/**
 * Crawls Linked Lemmy Instance Stats
 *
 * Based on code from stats crawler.
 * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
 */
async function crawlInstance(instanceBaseUrl) {
  const wellKnownUrl = "https://" + instanceBaseUrl + "/.well-known/nodeinfo";
  const wellKnownInfo = await axios.get(wellKnownUrl);

  let nodeinfoUrl;
  if (!wellKnownInfo.data.links) {
    console.log("no nodeinfo links", wellKnownInfo.data);
    return null;
  }

  for (var linkRel of wellKnownInfo.data.links) {
    if (linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0") {
      //   console.debug("Found nodeinfo 2.0", linkRel.href);
      nodeinfoUrl = linkRel.href;
    }
  }

  const nodeinfo2 = await axios.get(nodeinfoUrl);

  const software = nodeinfo2.data.software;

  if (software.name != "lemmy" && software.name != "lemmybb") {
    console.log("not a lemmy instance", software);
    await storeUnknownInstance(instanceBaseUrl, software);
    return null;
  }

  const siteInfo = await axios.get(
    "https://" + instanceBaseUrl + "/api/v3/site"
  );

  //   console.log(siteInfo.data);
  const instanceData = {
    nodeData: {
      software: nodeinfo2.data.software,
      usage: nodeinfo2.data.usage,
      openRegistrations: nodeinfo2.data.openRegistrations,
    },
    siteData: {
      site: siteInfo.data.site_view.site,
      config: siteInfo.data.site_view.local_site,
      counts: siteInfo.data.site_view.counts,
      admins: siteInfo.data.admins,
      version: siteInfo.data.version,
      taglines: siteInfo.data.taglines,
      federated: siteInfo.data.federated_instances,
    },
  };

  // store/update the instance
  await putInstanceData(instanceBaseUrl, instanceData);

  return instanceData;
}

/**
 * Create a job to crawl an instance stats
 *
 */
export function createInstanceCrawlJob(baseUrl) {
  const job = instanceQueue.createJob({ baseUrl });
  job.save();
  job.on("succeeded", (result) => {
    console.log(`finished instanceQueue`, baseUrl);
    if (result != null) {
      // nodeData
      const { usage, software } = result.nodeData;
      const { users, localPosts, localComments } = usage;

      // siteData
      const { name, actor_id } = result.siteData.site;

      console.log(`Url: ${actor_id}, Name: ${name}`);
      console.log(`Version: ${software.name} ${software.version}`);
      console.log(
        `Users: ${users.total} Posts: ${localPosts} Comments: ${localComments}`
      );

      createCommunityCrawlJob(job.data.baseUrl);

      if (result.siteData?.federated?.linked.length > 0) {
        console.log(
          "Crawling federated instances for",
          baseUrl,
          result.siteData.federated.linked.length
        );
        crawlFederatedInstances(baseUrl, result.siteData.federated);
      }
      console.log();
    }
  });
}

function crawlFederatedInstances(baseUrl, { linked, allowed, blocked }) {
  console.log("Crawling federated instances for", baseUrl);

  for (var instance of linked) {
    console.log("Crawling federated instance", instance);
    createInstanceCrawlJob(instance);
  }
}

// insert base jobs and start workers
export async function runInstanceCrawl() {
  // create
  instanceQueue.process(async (job) => {
    try {
      console.log(`Processing instanceQueue ${job.id}`, job.data);
      const instanceData = await crawlInstance(job.data.baseUrl);
      if (instanceData) {
        return instanceData;
      }
    } catch (e) {
      await storeOtherError(job.data.baseUrl, e);
      console.log(
        `Error crawling ${job.data.baseUrl}. ${e.message}`
        // e.isAxiosError ? e.response : ""
      );
    }
    return null;
  });
}
