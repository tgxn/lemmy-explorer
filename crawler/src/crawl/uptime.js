/** Uptime Crawler
 *
 * Meant to run max 1/day and get all uptime from api.fediverse.observer
 */
import logging from "../lib/logging.js";

import storage from "../storage.js";

import AxiosClient from "../lib/axios.js";

export default class CrawlUptime {
  constructor() {
    this.client = new AxiosClient();
  }

  async crawl() {
    const instances = await this.client.axios.post(
      "https://api.fediverse.observer/",
      {
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
      }
    );
    logging.info(instances.data);

    await storage.uptime.addNew({
      timestamp: Date.now(),
      nodes: instances.data.data.nodes,
    });
  }
}
