import logging from "../lib/logging.js";

import InstanceQueue from "../queue/instance.js";
import CommunityQueue from "../queue/community.js";
import SingleCommunityQueue from "../queue/check_comm.js";
import KBinQueue from "../queue/kbin.js";

export default async function runManualWorker(
  workerName,
  firstParam,
  secondParam
) {
  // scan one instance
  if (workerName == "i" || workerName == "instance") {
    logging.info(`Running Instance Crawl for ${firstParam}`);
    const instanceCrawl = new InstanceQueue(true, "instance_manual");
    await instanceCrawl.createJob(firstParam, (resultData) => {
      logging.info("Instance Crawl Complete");
      process.exit(0);
    });
  }

  // scan one community
  else if (workerName == "c" || workerName == "community") {
    logging.info(`Running Community Crawl for ${firstParam}`);
    const communityCrawl = new CommunityQueue(true, "community_manual");
    await communityCrawl.createJob(firstParam, (resultData) => {
      logging.info("Community Crawl Complete");
      process.exit(0);
    });
  }

  // finger one community
  else if (workerName == "s" || workerName == "single") {
    logging.info(`Running CrawlFinger Crawl for ${firstParam}`);
    const crawlOneComm = new SingleCommunityQueue(true, "one_community_manual");
    await crawlOneComm.createJob(firstParam, secondParam, (resultData) => {
      logging.info("CrawlFinger Crawl Complete");
      process.exit(0);
    });
  }

  // scan one kbin
  else if (workerName == "k" || workerName == "kbin") {
    logging.info(`Running Singel Q Scan KBIN Crawl for ${firstParam}`);
    const crawlKBinManual = new KBinQueue(true, "kbin_manual");
    await crawlKBinManual.createJob(firstParam, (resultData) => {
      logging.info("KBIN Crawl Complete");
      process.exit(0);
    });
  }
}
