/** Uptime Crawler
 *
 * Meant to run max 1/day and get all uptime from api.fediverse.observer
 */
import logging from "../lib/logging";

import crawlStorage from "../lib/crawlStorage";

import CrawlClient from "../lib/CrawlClient";

export default class CrawlUptime {
  private client: CrawlClient;

  constructor() {
    this.client = new CrawlClient();
  }

  async crawl() {
    const instances = await this.client.postUrl(
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

    await crawlStorage.uptime.addNew({
      timestamp: Date.now(),
      nodes: instances.data.data.nodes,
    });
  }
}
