import logging from "../lib/logging";

import InstanceQueue from "../queue/instance";
import CommunityQueue from "../queue/community_list";
import SingleCommunityQueue from "../queue/community_single";
import MBinQueue from "../queue/mbin";
import PiefedQueue from "../queue/piefed";

export default async function runManualWorker(workerName: string, firstParam: string, secondParam: string) {
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

  // scan one mbin
  else if (workerName == "m" || workerName == "mbin") {
    logging.info(`Running Single MBin Crawl for ${firstParam}`);
    const crawlMBinManual = new MBinQueue(true, "mbin_manual");
    await crawlMBinManual.createJob(firstParam, (resultData) => {
      logging.info("MBIN Crawl Complete");
      process.exit(0);
    });
  }

  // scan one piefed
  else if (workerName == "p" || workerName == "piefed") {
    logging.info(`Running Single Piefed Crawl for ${firstParam}`);
    const crawlPiefedManual = new PiefedQueue(true, "piefed_manual");
    await crawlPiefedManual.createJob(firstParam, (resultData) => {
      logging.info("Piefed Crawl Complete");
      process.exit(0);
    });
  }
}
