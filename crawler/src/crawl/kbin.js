import logging from "../lib/logging.js";

import storage from "../storage.js";

import { CrawlError } from "../lib/error.js";

import { RECRAWL_AGED_MS } from "../lib/const.js";

import AxiosClient from "../lib/axios.js";

export default class CrawlKBin {
  constructor() {
    this.fediverseData = null;
    this.logPrefix = `[CrawlKBin]`;

    this.client = new AxiosClient();
  }

  async scanAllKBin() {
    try {
      // get all fedi kbin servers
      const kbinServers = await this.getKBin();
      logging.info(`KBin Instances Total: ${kbinServers.length}`);

      for (const kbinServer of kbinServers) {
        this.logPrefix = `[CrawlKBin] [${kbinServer.base}]`;

        // await this.scanKBinInstance(kbinServer.base);
        try {
          const pageData = await this.getPageData(kbinServer.base);
          console.log(
            `${this.logPrefix} Version: ${kbinServer.version} got page`,
            pageData
          );
        } catch (e) {
          if (
            e &&
            e.data &&
            e.data["@type"] &&
            e.data["@type"].indexOf("hydra") !== -1
          ) {
            // remove trace
            delete e.data.trace;
            console.error(
              `${this.logPrefix} Version: ${kbinServer.version} error getting page /api/magazines`,
              e.data
            );
          } else {
            console.error(
              `${this.logPrefix} Version: ${kbinServer.version} error getting page /api/magazines`,
              e.data.message
            );
          }
        }
      }
      this.logPrefix = `[CrawlKBin]`;

      // scan instance

      // create scan job for magazines
    } catch (e) {
      console.error(`${this.logPrefix} error scanning kbin instance`, e);
    }
  }

  // paginated scan of magazines
  async getPageData(kbinServerBase, pageNumber = 1) {
    // logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

    let communityList;
    try {
      communityList = await this.client.getUrlWithRetry(
        "https://" + kbinServerBase + "/api/magazines",
        {
          timeout: 3000, // smaller for nodeinfo
          // params: {
          //   type_: "Local",
          //   limit: 50,
          //   page: pageNumber,
          //   show_nsfw: true, // Added in 0.18.x? ish...
          // },
        },
        0
      );

      const communities = communityList.data;
      return communities;
    } catch (e) {
      throw new CrawlError("failed to get magazine list", e);
    }

    // // must be an array
    // if (!Array.isArray(communities)) {
    //   logging.trace(`${this.logPrefix}`, communityList.data);
    //   throw new CrawlError(`Community list not an array: ${communities}`);
    // }

    // return communities;
  }

  // scan and check if the instance iteself is alive
  async scanKBinInstance(kbinServerBase) {
    const wellKnownUrl = "https://" + kbinServerBase + "/.well-known/nodeinfo";

    const wellKnownInfo = await this.client.getUrlWithRetry(
      wellKnownUrl,
      {
        timeout: 10000, // smaller for nodeinfo
      },
      0
    );

    // logging.info("wellKnownInfo", wellKnownInfo.data);

    return wellKnownInfo.data;
  }

  // get list of all known kbin servers
  async getKBin() {
    logging.info("Fetching KBin Instances");

    this.fediverseData = await storage.fediverse.getAll();

    const kbinFedServers = Object.entries(this.fediverseData)
      .filter((fediServer) => {
        return fediServer[1].name === "kbin";
      })
      .map((fediServer) => {
        return {
          base: fediServer[0].replace("fediverse:", ""),
          ...fediServer[1],
        };
      });

    return kbinFedServers;
  }
}
