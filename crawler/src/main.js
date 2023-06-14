import cron from "node-cron";

import CrawlInstance from "./crawl/instance.js";
import CrawlCommunity from "./crawl/communities.js";

import CrawlOutput from "./crawl/output.js";
import CrawlAged from "./crawl/aged.js";
import CrawlUptime from "./crawl/uptime.js";

import {
  START_URLS,
  AGED_CRON_EXPRESSION,
  UPTIME_CRON_EXPRESSION,
} from "./lib/const.js";

export async function start(args) {
  if (args.length > 0) {
    if (args.indexOf("--out") > -1) {
      console.log("Generate JSON Output");

      const output = new CrawlOutput();
      await output.start();

      return process.exit(0);
    }

    if (args.indexOf("--cron") > -1) {
      console.log("Started Cron Task");
      const agedTask = cron.schedule(AGED_CRON_EXPRESSION, () => {
        const aged = new CrawlAged();
        aged.createJobs();
      });
      const uptimeTask = cron.schedule(UPTIME_CRON_EXPRESSION, () => {
        const uptime = new CrawlUptime();
        uptime.crawl();
      });

      return;
    }

    if (args.indexOf("--aged") > -1) {
      const aged = new CrawlAged();
      aged.createJobs();
      return;
    }

    if (args.indexOf("--uptime") > -1) {
      const uptime = new CrawlUptime();
      uptime.crawl();
      return;
    }

    if (args.indexOf("--health") > -1) {
      const instanceCrawl = new CrawlInstance(false);
      const counts = await instanceCrawl.queue.checkHealth();
      console.log("Instance Worker Health:", counts);

      const communityCrawl = new CrawlCommunity(false);
      const commCounts = await communityCrawl.queue.checkHealth();
      console.log("Community Worker Health:", commCounts);

      return process.exit(0);
    }

    // start specific queue workers
    if (args[0] == "-q" && args[1] == "instance") {
      console.info("Starting Instance Processor");
      new CrawlInstance(true);
      return;
    } else if (args[0] == "-q" && args[1] == "community") {
      console.info("Starting Community Processor");
      new CrawlCommunity(true);

      return;
    }

    // should we initialize the workers with a starter list of lemmy's?
    if (args.indexOf("--init") > -1) {
      console.warn("--init passed, creating seed jobs");
      const crawler = new CrawlInstance();
      for (var baseUrl of START_URLS) {
        crawler.createJob(baseUrl);
      }
      // crawler.createJob("lemmy.tgxn.net");
      return;
    }
  } else {
    console.info("no args, starting all crawler workers");
    new CrawlInstance(true);
    new CrawlCommunity(true);
  }
}
