import CrawlInstance from "./crawl/instance.js";
import CrawlCommunity from "./crawl/communities.js";

import CrawlOutput from "./output.js";

import { START_URLS } from "./lib/const.js";

export function start(args) {
  if (args.length > 0) {
    if (args.indexOf("--out") > -1) {
      console.log("Generate JSON Output");

      const output = new CrawlOutput();
      output.start();

      return;
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
      console.warn("--init passed, Creating Starter Jobs");
      const crawler = new CrawlInstance();
      for (var baseUrl of START_URLS) {
        crawler.createJob(baseUrl);
      }
      //   crawler.createJob("lemmy.tgxn.net");
    }
  }

  console.info("Starting All Crawler Workers");
  new CrawlInstance(true);
  new CrawlCommunity(true);
}
