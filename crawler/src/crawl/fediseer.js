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

export default class CrawlFediseer {
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
    /**
     * - guarantee - "single instance parent" - once per domain - "not spam"
     *   one to one mapping of an instance and a parent instance that has guaranteed it is not spam
     *
     * - endorsement - instances can endorse many other instances
     *   "instance friends" - how many other friends this instance has
     *
     * - approvals
     *   how many instances this one has endorsed
     */

    const fediseerWhitelist = await this.axios.get(
      "https://fediseer.com/api/v1/whitelist?endorsements=0&guarantors=0"
      //  {
      //   query: `query{
      //         nodes (softwarename: "lemmy") {
      //         domain
      //         latency
      //         countryname
      //         uptime_alltime
      //         date_created
      //         date_updated
      //         date_laststats
      //         score
      //         status
      //         }
      //     }`,
      // }
    );
    logging.info(
      `https://fediseer.com/api/v1/whitelist?endorsements=0&guarantors=1`
    );
    logging.info(
      `fediseer whitelist total: ${fediseerWhitelist.data.instances.length}`
    );

    const instances = [...fediseerWhitelist.data.instances];

    await storage.fediseer.addNew(instances);

    // let domainGuarantees = {};
    // for (var instance of instances) {
    //   // logging.info(instance);

    //   if (domainGuarantees[instance.domain] == null) {
    //     domainGuarantees[instance.domain] = [instance];
    //   } else {
    //     // logging.info("adding instance to domainGuarantees", instance);
    //     domainGuarantees[instance.domain].push(instance);
    //   }

    //   // await storage.instance.addNew({
    //   //   timestamp: Date.now(),
    //   //   instance: instance.domain,
    //   // });
    // }

    // console.log("my instance");
    // console.table(domainGuarantees["lemmy.tgxn.net"]);

    // console.log("bad instance");
    // console.table(domainGuarantees["lemmy.podycust.co.uk"]);

    // console.log("good instance");
    // console.table(domainGuarantees["lemm.ee"]);

    // // sort by claimed and log top 5
    // let sortedGuarantees = instances.sort((a, b) => b.approvals - a.approvals);

    // console.log("sorted by approvals");
    // console.table(sortedGuarantees.slice(0, 7));

    // // sort by claimed and log top 5
    // let sortedEndorsements = instances.sort(
    //   (a, b) => b.endorsements - a.endorsements
    // );

    // console.log("sorted by endorsements");
    // console.table(sortedEndorsements.slice(0, 7));
  }
}
