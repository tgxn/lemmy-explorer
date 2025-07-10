import cron from "node-cron";

import { AUTO_UPLOAD_S3, CRON_SCHEDULES } from "../lib/const";
import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import InstanceQueue from "../queue/instance";
import CommunityQueue from "../queue/community_list";
import SingleCommunityQueue from "../queue/community_single";
import MBinQueue from "../queue/mbin";
import PiefedQueue from "../queue/piefed";

// used to create scheduled instance checks
import CrawlAged from "../util/aged";
import CrawlFediseer from "../crawl/fediseer";
import CrawlUptime from "../crawl/uptime";
import CrawlMBin from "../crawl/mbin";
import CrawlPiefed from "../crawl/piefed";

import { syncCheckpoint } from "../output/sync_s3";

/**
 * Queue worker and CRON tasks are started here.
 */
export default async function startWorker(startWorkerName: string) {
  if (startWorkerName == null) {
    logging.error("startWorkerName is null");
    throw new Error("startWorkerName is null");
  }

  // queue workers
  if (startWorkerName == "instance") {
    logging.info("Starting InstanceQueue Processor");
    new InstanceQueue(true);
  } else if (startWorkerName == "community") {
    logging.info("Starting CommunityQueue Processor");
    new CommunityQueue(true);
  } else if (startWorkerName == "single") {
    logging.info("Starting SingleCommunityQueue Processor");
    new SingleCommunityQueue(true);
  } else if (startWorkerName == "mbin") {
    logging.info("Starting MBinQueue Processor");
    new MBinQueue(true);
  } else if (startWorkerName == "piefed") {
    logging.info("Starting PiefedQueue Processor");
    new PiefedQueue(true);
  }

  // cron worker
  else if (startWorkerName == "cron") {
    logging.info("Creating Cron Tasks (Aged/Uptime)");

    logging.info("Creating Aged Cron Task", CRON_SCHEDULES.AGED);
    cron.schedule(CRON_SCHEDULES.AGED, async (time) => {
      try {
        console.log("Running Aged Cron Task", time);
        await storage.connect();

        const aged = new CrawlAged();
        await aged.createJobs();

        await storage.close();
      } catch (e) {
        console.log("Error in Aged Cron Task", e);
      }
    });

    if (AUTO_UPLOAD_S3) {
      logging.info("Creating DUMP Task", CRON_SCHEDULES.PUBLISH_S3);
      cron.schedule(CRON_SCHEDULES.PUBLISH_S3, async (time) => {
        try {
          await syncCheckpoint();
        } catch (e) {
          console.log("Error in DUMP Task", e);
        }
      });
    }

    // shares CRON_SCHEDULES.MBIN
    logging.info("Creating MBin Cron Task", CRON_SCHEDULES.MBIN);
    cron.schedule(CRON_SCHEDULES.MBIN, async (time) => {
      console.log("Running MBin Cron Task", time);
      await storage.connect();

      const mbinScan = new CrawlMBin();
      await mbinScan.createJobsAllMBin();

      await storage.close();
    });

    // shares CRON_SCHEDULES.PIEFED
    logging.info("Creating Piefed Cron Task", CRON_SCHEDULES.PIEFED);
    cron.schedule(CRON_SCHEDULES.PIEFED, async (time) => {
      console.log("Running Piefed Cron Task", time);
      await storage.connect();

      const piefedScan = new CrawlPiefed();
      await piefedScan.createJobsAllPiefed();

      await storage.close();
    });

    logging.info("Creating Uptime Cron Task", CRON_SCHEDULES.UPTIME);
    cron.schedule(CRON_SCHEDULES.UPTIME, async (time) => {
      console.log("Running Uptime Cron Task", time);
      await storage.connect();

      const uptime = new CrawlUptime();
      await uptime.crawl();

      await storage.close();
    });

    // Crawl Fediseer
    logging.info("Creating CrawlFediseer Cron Task", CRON_SCHEDULES.FEDISEER);
    cron.schedule(CRON_SCHEDULES.FEDISEER, async (time) => {
      console.log("Running CrawlFediseer Cron Task", time);
      await storage.connect();

      const fediseerCrawl = new CrawlFediseer();
      await fediseerCrawl.crawl();

      await storage.close();
    });

    logging.info("Cron Tasks Created");
  }
}
