// meant to run max 1/day and get all uptime
import axios, { AxiosError } from "axios";

import { putUptimeData, getLatestUptimeData } from "../lib/storage.js";

import {
  CRAWL_TIMEOUT,
  CRAWL_RETRY,
  MIN_RECRAWL_MS,
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
    console.log(instances.data);
    await putUptimeData({
      timestamp: Date.now(),
      nodes: instances.data.data.nodes,
    });
  }
}
