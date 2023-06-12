import { createInstanceCrawlJob, runInstanceCrawl } from "./crawl/instance.js";

import {
  createCommunityCrawlJob,
  runCommunityCrawl,
} from "./crawl/communities.js";

// let baseUrl = "https://lemmy.tgxn.net";

const siteUrls = [
  "lemmy.tgxn.net",
  "lemmy.ml",
  "ds9.lemmy.ml",
  "enterprise.lemmy.ml",
  "voyager.lemmy.ml",
  "test.lemmy.ml",
];

function start() {
  createInstanceCrawlJob("vlemmy.net");
  //   for (var baseUrl of siteUrls) {
  //     createInstanceCrawlJob(baseUrl);
  //   }

  runInstanceCrawl();
  runCommunityCrawl();
}

start();
