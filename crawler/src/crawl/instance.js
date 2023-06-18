import logging from "../lib/logging.js";

import axios from "axios";

import storage from "../storage.js";

import {
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
  AXIOS_REQUEST_TIMEOUT,
} from "../lib/const.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";

export default class InstanceCrawler {
  constructor(crawlDomain) {
    this.crawlDomain = crawlDomain;

    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });
  }

  // fully process the instance crawl, called from bequeue and errors are handled above this
  async crawl() {
    const instanceData = await this.crawlInstance(this.crawlDomain);

    if (instanceData) {
      // store/update the instance
      await storage.putRedis(`instance:${this.crawlDomain}`, {
        ...instanceData,
        lastCrawled: Date.now(),
      });

      logging.info(
        `[Instance] [${this.crawlDomain}] Completed OK (Found "${instanceData?.siteData?.site?.name}")`
      );

      return instanceData;
    }

    throw new CrawlError("No instance data returned");
  }

  /**
   * Crawls Linked Lemmy Instance Stats
   *
   * Based on code from stats crawler.
   * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
   */
  async crawlInstance() {
    const wellKnownUrl =
      "https://" + this.crawlDomain + "/.well-known/nodeinfo";
    const wellKnownInfo = await this.axios.get(wellKnownUrl);

    let nodeinfoUrl;
    if (!wellKnownInfo.data.links) {
      throw new CrawlError("missing /.well-known/nodeinfo links");
    }

    for (var linkRel of wellKnownInfo.data.links) {
      if (linkRel.rel == "http://nodeinfo.diaspora.software/ns/schema/2.0") {
        nodeinfoUrl = linkRel.href;
      }
    }
    if (!nodeinfoUrl) {
      throw new CrawlError("no diaspora rel in /.well-known/nodeinfo");
    }

    const nodeinfo2 = await this.axios.get(nodeinfoUrl);
    if (!nodeinfo2.data.software) {
      throw new CrawlError("no software key in " + nodeinfoUrl);
    }
    const software = nodeinfo2.data.software;

    // store all fediverse instance software for easy metrics
    const dd = { time: Date.now(), ...software };
    return storage.putRedis(`fediverse:${this.crawlDomain}`, dd);

    if (software.name != "lemmy" && software.name != "lemmybb") {
      throw new CrawlWarning(`not a lemmy instance (${software.name})`);
    }

    const siteInfo = await this.axios.get(
      "https://" + this.crawlDomain + "/api/v3/site"
    );

    /**
     * map all languages to array of their codes
     */

    function mapLangsToCodes(allLangsArray, discussionIdsArray) {
      const discussionLangs = [];

      if (!allLangsArray) return [];
      if (!discussionIdsArray) return [];

      /// if all are selected, set flag
      let allSelected = false;
      if (allLangsArray.length === discussionIdsArray.length) {
        allSelected = true;
      }
      if (!allSelected) {
        discussionIdsArray.forEach((id) => {
          const languageData = allLangsArray.find((lang) => lang.id === id);
          discussionLangs.push(languageData.code);
        });
      } else {
        discussionLangs.push("all");
      }

      return discussionLangs;
    }

    const discussionLangs = mapLangsToCodes(
      siteInfo.data.all_languages,
      siteInfo.data.discussion_languages
    );

    //   logging.info(siteInfo.data);
    const instanceData = {
      nodeData: {
        software: nodeinfo2.data.software,
        usage: nodeinfo2.data.usage,
        openRegistrations: nodeinfo2.data.openRegistrations,
      },
      siteData: {
        site: siteInfo.data.site_view.site,
        config: siteInfo.data.site_view.local_site,
        counts: siteInfo.data.site_view.counts,
        admins: siteInfo.data.admins,
        version: siteInfo.data.version,
        taglines: siteInfo.data.taglines,
        federated: siteInfo.data.federated_instances,
      },
      langs: discussionLangs,
    };

    return instanceData;
  }
}
