import logging from "./lib/logging.js";

import cron from "node-cron";

import InstanceQueue from "./queue/instance.js";
import CommunityQueue from "./queue/community.js";

import CrawlOutput from "./crawl/output.js";
import CrawlAged from "./crawl/aged.js";
import CrawlUptime from "./crawl/uptime.js";

import storage from "./storage.js";

import {
  START_URLS,
  AGED_CRON_EXPRESSION,
  UPTIME_CRON_EXPRESSION,
  AUTO_UPLOAD_S3,
  PUBLISH_S3_BUCKET,
  PUBLISH_S3_CRON,
} from "./lib/const.js";

export async function start(args) {
  await storage.connect();

  if (args.length > 0) {
    // single-argument commands
    if (args.length === 1) {
      switch (args[0]) {
        case "--help":
          logging.info("Help");
          break;

        // generate output .json files from data stored in redis
        case "--out":
          logging.info("Generate JSON Output");

          const output = new CrawlOutput();
          await output.start();

          return process.exit(0);

        // should we initialize the workers with a starter list of lemmy's?
        case "--init":
          logging.warn("--init passed, creating seed jobs");
          const crawler = new InstanceQueue();
          for (var baseUrl of START_URLS) {
            await crawler.createJob(baseUrl);
          }
          // await crawler.createJob("lemmy.tgxn.net");
          return process.exit(0);

        // get redis bb queue health from redis
        case "--health":
          const instanceCrawl = new InstanceQueue(false);
          const counts = await instanceCrawl.queue.checkHealth();
          logging.info("Instance Worker Health:", counts);

          const communityCrawl = new CommunityQueue(false);
          const commCounts = await communityCrawl.queue.checkHealth();
          logging.info("Community Worker Health:", commCounts);

          return process.exit(0);

        // adds ages domain jobs immediately
        case "--aged":
          const aged = new CrawlAged();
          await aged.createJobs();

          return process.exit(0);

        // crawl the fediverse uptime immediately
        case "--uptime":
          const uptime = new CrawlUptime();
          await uptime.crawl();

          return process.exit(0);

        // starts all cron workers (aged, uptime)
        case "--cron":
          logging.info("Creating Cron Tasks (Aged/Uptime)");

          const agedTask = cron.schedule(AGED_CRON_EXPRESSION, async () => {
            const aged = new CrawlAged();
            aged.createJobs();
          });

          const uptimeTask = cron.schedule(UPTIME_CRON_EXPRESSION, async () => {
            const uptime = new CrawlUptime();
            uptime.crawl();
          });

          if (AUTO_UPLOAD_S3) {
            console.log("Creating S3 Publish Cron Task", PUBLISH_S3_CRON);
            const outputTask = cron.schedule(
              UPTIME_CRON_EXPRESSION,
              async () => {
                const output = new CrawlOutput();
                const outputResult = await output.start();

                // push to s3 if successful
                if (outputResult) {
                  console.log("Should Push to S3", PUBLISH_S3_BUCKET);
                }
              }
            );
          }
          return; // dont exit the process cause they are long running
      }
    }

    // start specific queue workers
    else if (args.length === 2 && args[0] == "-q") {
      if (args[1] == "instance") {
        logging.info("Starting Instance Processor");
        new InstanceQueue(true);
        return;
      } else if (args[1] == "community") {
        logging.info("Starting Community Processor");
        new CommunityQueue(true);

        return;
      }
    }

    // scan one instance
    else if (args.length === 2 && args[0] == "-i") {
      logging.info(`Running Instance Crawl for ${args[1]}`);
      const instanceCrawl = new InstanceQueue(true, "instance_manual");
      await instanceCrawl.createJob(args[1], (resultData) => {
        logging.info("Instance Crawl Complete");
        process.exit(0);
      });
    }

    // scan one community
    else if (args.length === 2 && args[0] == "-c") {
      logging.info(`Running Community Crawl for ${args[1]}`);
      const communityCrawl = new CommunityQueue(true, "community_manual");
      await communityCrawl.createJob(args[1], (resultData) => {
        logging.info("Community Crawl Complete");

        process.exit(0);
      });
    }
  } else {
    logging.info("no args, starting all crawler workers");
    new InstanceQueue(true);
    new CommunityQueue(true);
  }

  // storage.close();
}
