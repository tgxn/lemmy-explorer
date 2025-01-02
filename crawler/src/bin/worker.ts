import cron from "node-cron";

import logging from "../lib/logging";

import InstanceQueue from "../queue/instance";
import CommunityQueue from "../queue/community_list";
import SingleCommunityQueue from "../queue/community_single";
import KBinQueue from "../queue/kbin";

import CrawlAged from "../util/aged";
import CrawlFediseer from "../crawl/fediseer";
import CrawlUptime from "../crawl/uptime";
import CrawlKBin from "../crawl/kbin";

import { syncCheckpoint } from "../output/sync_s3";

import { AUTO_UPLOAD_S3, CRON_SCHEDULES } from "../lib/const";

import crawlStorage from "../crawlStorage";

/**
 * Queue worker and CRON tasks are started here.
 */
export default async function startWorker(startWorkerName = null) {
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
  } else if (startWorkerName == "kbin") {
    logging.info("Starting KBinQueue Processor");
    new KBinQueue(true);
  }

  // cron worker
  else if (startWorkerName == "cron") {
    logging.info("Creating Cron Tasks (Aged/Uptime)");

    logging.info("Creating Aged Cron Task", CRON_SCHEDULES.AGED);
    cron.schedule(CRON_SCHEDULES.AGED, async (time) => {
      try {
        console.log("Running Aged Cron Task", time);
        await crawlStorage.connect();

        const aged = new CrawlAged();
        await aged.createJobs();

        await crawlStorage.close();
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

    // shares CRON_SCHEDULES.KBIN
    logging.info("Creating KBin Cron Task", CRON_SCHEDULES.KBIN);
    cron.schedule(CRON_SCHEDULES.KBIN, async (time) => {
      console.log("Running KBin Cron Task", time);
      await crawlStorage.connect();

      const kbinScan = new CrawlKBin();
      await kbinScan.createJobsAllKBin();

      await crawlStorage.close();
    });

    logging.info("Creating Uptime Cron Task", CRON_SCHEDULES.UPTIME);
    cron.schedule(CRON_SCHEDULES.UPTIME, async (time) => {
      console.log("Running Uptime Cron Task", time);
      await crawlStorage.connect();

      const uptime = new CrawlUptime();
      await uptime.crawl();

      await crawlStorage.close();
    });

    // Crawl Fediseer
    logging.info("Creating CrawlFediseer Cron Task", CRON_SCHEDULES.FEDISEER);
    cron.schedule(CRON_SCHEDULES.FEDISEER, async (time) => {
      console.log("Running CrawlFediseer Cron Task", time);
      await crawlStorage.connect();

      const fediseerCrawl = new CrawlFediseer();
      await fediseerCrawl.crawl();

      await crawlStorage.close();
    });

    logging.info("Cron Tasks Created");
  }
}
