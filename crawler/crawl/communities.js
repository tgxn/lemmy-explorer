import axios from "axios";
import Queue from "bee-queue";

import {
  putInstanceData,
  putCommunityData,
  getInstanceData,
  getCommunityData,
  listInstanceData,
  listCommunityData,
} from "../storage.js";

const communityQueue = new Queue("community");

export function createCommunityCrawlJob(baseUrl) {
  const job = communityQueue.createJob({ baseUrl });
  job.save();
  job.on("succeeded", (result) => {
    console.log(`finished instanceQueue`);
    console.log();
  });
}

// insert base jobs and start workers
export async function runCommunityCrawl() {
  communityQueue.process(async (job) => {
    try {
      console.log(`Processing communityQueue ${job.id}`, job.data);

      const instanceBaseUrl = job.data.baseUrl;

      async function pageCommList(instanceBase, pageNumber) {
        const communityList = await axios.get(
          "https://" + instanceBaseUrl + "/api/v3/community/list",
          {
            params: {
              type_: "Local",
              page: pageNumber,
              limit: 50,
            },
          }
        );
        const communities = communityList.data.communities;

        let list = [];

        list.push(...communities);

        if (communities.length == 50) {
          const pagenew = await pageCommList(instanceBase, pageNumber + 1);

          list.push(...pagenew);
        }

        return list;
      }

      const communityList = await pageCommList(instanceBaseUrl, 1);

      for (var community of communityList) {
        //   console.log(community);

        await putCommunityData(instanceBaseUrl, community);
      }

      console.log(`Found ${communityList.length} Local communities`);

      return communityList;
    } catch (e) {
      console.log(
        `Error crawling ${job.data.baseUrl}. ${e.message}`
        // e.isAxiosError ? e.response : ""
      );
    }
    return null;
  });
}
