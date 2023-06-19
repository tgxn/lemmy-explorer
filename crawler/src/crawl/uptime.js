/** Uptime Crawler
 *
 * Meant to run max 1/day and get all uptime from api.fediverse.observer
 */
import logging from "../lib/logging.js";

import axios from "axios";

import storage from "../storage.js";

import {
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
  AXIOS_REQUEST_TIMEOUT,
} from "../lib/const.js";

export default class CrawlUptime {
  constructor() {
    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });
  }

  async crawl() {
    const instances = await this.axios.post("https://api.fediverse.observer/", {
      query: `query{
            nodes (softwarename: "lemmy") {
            domain
            latency
            countryname
            uptime_alltime
            date_created
            date_updated
            date_laststats
            score
            status
            }
        }`,
    });
    logging.info(instances.data);

    await storage.uptime.addNew({
      timestamp: Date.now(),
      nodes: instances.data.data.nodes,
    });
  }
}
