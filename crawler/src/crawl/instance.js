import logging from "../lib/logging.js";

import axios from "axios";

import storage from "../storage.js";

import {
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
  AXIOS_REQUEST_TIMEOUT,
} from "../lib/const.js";

import { CrawlError, CrawlWarning } from "../lib/error.js";
import { getActorBaseUrl } from "../lib/validator.js";

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
      await storage.instance.upsert(this.crawlDomain, {
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

  async getNodeInfo() {
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

    const nodeNodeInfoData = await this.axios.get(nodeinfoUrl);
    return nodeNodeInfoData.data;
  }

  async getSiteInfo() {
    const siteInfo = await this.axios.get(
      "https://" + this.crawlDomain + "/api/v3/site"
    );

    return siteInfo.data;
  }

  /**
   * Crawls Linked Lemmy Instance Stats
   *
   * Based on code from stats crawler.
   * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
   */
  async crawlInstance() {
    const nodeInfo = await this.getNodeInfo();
    if (!nodeInfo.software) {
      throw new CrawlError("no software key found for " + this.crawlDomain);
    }

    // store all fediverse instance software for easy metrics
    await storage.fediverse.upsert(this.crawlDomain, nodeInfo.software);

    // only allow lemmy instances
    if (
      nodeInfo.software.name != "lemmy" &&
      nodeInfo.software.name != "lemmybb"
    ) {
      throw new CrawlWarning(
        `not a lemmy instance (${nodeInfo.software.name})`
      );
    }

    const siteInfo = await this.getSiteInfo();

    const actorBaseUrl = getActorBaseUrl(siteInfo.site_view.site.actor_id);
    if (!actorBaseUrl) {
      console.error(
        `${this.crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`
      );
      throw new CrawlError(
        `${this.crawlDomain}: invalid actor id: ${siteInfo.site_view.site.actor_id}`
      );
    }

    if (actorBaseUrl !== this.crawlDomain) {
      console.error(
        `${this.crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`
      );
      throw new CrawlError(
        `${this.crawlDomain}: actor id does not match instance domain: ${siteInfo.site_view.site.actor_id}`
      );
    }

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
      siteInfo.all_languages,
      siteInfo.discussion_languages
    );

    //   logging.info(siteInfo);
    const instanceData = {
      nodeData: {
        software: nodeInfo.software,
        usage: nodeInfo.usage,
        openRegistrations: nodeInfo.openRegistrations,
      },
      siteData: {
        site: siteInfo.site_view.site,
        config: siteInfo.site_view.local_site,
        counts: siteInfo.site_view.counts,
        admins: siteInfo.admins,
        version: siteInfo.version,
        taglines: siteInfo.taglines,
        federated: siteInfo.federated_instances,
      },
      langs: discussionLangs,
    };

    return instanceData;
  }
}
