import cron from "node-cron";

import logging from "../lib/logging.js";

import InstanceQueue from "../queue/instance.js";
import CommunityQueue from "../queue/community.js";
import SingleCommunityQueue from "../queue/check_comm.js";
import KBinQueue from "../queue/kbin.js";

import CrawlAged from "../crawl/aged.js";
import CrawlUptime from "../crawl/uptime.js";
import CrawlKBin from "../crawl/kbin.js";

import {
  AGED_CRON_EXPRESSION,
  KBIN_CRON_EXPRESSION,
  UPTIME_CRON_EXPRESSION,
} from "../lib/const.js";

import storage from "../storage.js";

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

    logging.info("Creating Aged Cron Task", AGED_CRON_EXPRESSION);
    cron.schedule(
      AGED_CRON_EXPRESSION,
      async (time) => {
        try {
          console.log("Running Aged Cron Task", time);
          await storage.connect();

          const aged = new CrawlAged();
          await aged.createJobs();

          await storage.close();
        } catch (e) {
          console.log("Error in Aged Cron Task", e);
        }
      },
      {
        runOnInit: true,
      }
    );

    // shares KBIN_CRON_EXPRESSION
    logging.info("Creating KBin Cron Task", KBIN_CRON_EXPRESSION);
    cron.schedule(KBIN_CRON_EXPRESSION, async (time) => {
      console.log("Running KBin Cron Task", time);
      await storage.connect();

      const kbinScan = new CrawlKBin();
      await kbinScan.createJobsAllKBin();

      await storage.close();
    });

    logging.info("Creating Uptime Cron Task", UPTIME_CRON_EXPRESSION);
    cron.schedule(UPTIME_CRON_EXPRESSION, async (time) => {
      console.log("Running Uptime Cron Task", time);
      await storage.connect();

      const uptime = new CrawlUptime();
      await uptime.crawl();

      await storage.close();
    });

    logging.info("Cron Tasks Created");

    // if (AUTO_UPLOAD_S3) {
    //   console.log("Creating S3 Publish Cron Task", PUBLISH_S3_CRON);
    //   const outputTask = cron.schedule(UPTIME_CRON_EXPRESSION, async () => {
    //     const output = new CrawlOutput();
    //     const outputResult = await output.start();

    //     // push to s3 if successful
    //     if (outputResult) {
    //       console.log("Should Push to S3", PUBLISH_S3_BUCKET);
    //     }
    //   });
    // }
  }
}
