import logging from "../lib/logging";

import InstanceQueue from "../queue/instance";
import CommunityQueue from "../queue/community";
import SingleCommunityQueue from "../queue/check_comm";
import KBinQueue from "../queue/kbin";

import CrawlOutput from "../output/output";
import { syncCheckpoint } from "../output/sync_s3";

import CrawlAged from "../crawl/aged";
import CrawlUptime from "../crawl/uptime";
import CrawlFediseer from "../crawl/fediseer";

import Failures from "../crawl/failures";
import CrawlKBin from "../crawl/kbin";

import storage from "../storage";

import { START_URLS } from "../lib/const";

type ITaskName =
  | "out"
  | "sync"
  | "clean"
  | "fedi"
  | "init"
  | "health"
  | "aged"
  | "kbin"
  | "uptime";

// used to run tasks against db that exist after they are complete
export default async function runTask(taskName: ITaskName) {
  logging.silly("Running Task:", taskName);

  if (taskName == null) {
    logging.error("taskName is null");
    throw new Error("taskName is null");
  }

  await storage.connect();

  switch (taskName) {
    // generate output .json files from data stored in redis
    // @TODO add a flag to throw if there is no/very little change, overall <1%?
    case "out":
      logging.info("Generate JSON Output");

      const output = new CrawlOutput();
      await output.start();

      break;

    case "sync":
      logging.info("Sync JSON Output to S3");

      await syncCheckpoint();

      break;

    case "clean":
      console.log("Cleaning data");

      const failures = new Failures();
      await failures.clean();

      break;

    case "fedi":
      console.log("Running Fediseer Crawl");

      const fediseerCrawl = new CrawlFediseer();
      await fediseerCrawl.crawl();

      break;

    // should we initialize the workers with a starter list of lemmy's?
    case "init":
      logging.warn("--init passed, creating seed jobs");

      // await crawler.createJob("lemmy.tgxn.net");
      const crawler = new InstanceQueue();
      for (var baseUrl of START_URLS) {
        await crawler.createJob(baseUrl);
      }

      break;

    // get redis bb queue health from redis
    case "health":
      const healthData = [];

      const instanceCrawl = new InstanceQueue(false);
      const counts = await instanceCrawl.queue.checkHealth();
      healthData.push({
        queue: "InstanceQueue",
        ...counts,
      });

      const communityCrawl = new CommunityQueue(false);
      const commCounts = await communityCrawl.queue.checkHealth();
      healthData.push({
        queue: "CommunityQueue",
        ...commCounts,
      });

      const singleCommCrawl = new SingleCommunityQueue(false);
      const commSingleCounts = await singleCommCrawl.queue.checkHealth();
      healthData.push({
        queue: "SingleCommunityQueue",
        ...commSingleCounts,
      });

      const kbinQHealthCrawl = new KBinQueue(false);
      const kbinQHeCounts = await kbinQHealthCrawl.queue.checkHealth();
      healthData.push({
        queue: "KBinQueue",
        ...kbinQHeCounts,
      });

      console.info("Queue Health Metrics");
      console.table(healthData, [
        "queue",
        "waiting",
        "active",
        "succeeded",
        "failed",
      ]);

      // record health

      const agedAge = new CrawlAged();
      await agedAge.recordAges();

      break;

    // adds ages domain jobs immediately
    case "aged":
      const aged = new CrawlAged();
      await aged.createJobs();

      break;

    // create jobs for all known kbin instances
    case "kbin":
      const kbinScan = new CrawlKBin();
      await kbinScan.createJobsAllKBin();

      break;

    // crawl the fediverse uptime immediately
    case "uptime":
      const uptime = new CrawlUptime();
      await uptime.crawl();

      break;
  }

  logging.silly("Task Complete:", taskName);
  await storage.close();
  return process.exit(0);
}
