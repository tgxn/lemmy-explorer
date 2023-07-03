import logging from "../lib/logging.js";

import storage from "../storage.js";

import { CrawlError } from "../lib/error.js";

import { RECRAWL_AGED_MS } from "../lib/const.js";

import AxiosClient from "../lib/axios.js";

// const util = require("util");
// const execAsync = util.promisify(require("child_process").exec);

import path from "path";

import util from "util";
import { exec } from "child_process";

const execAsync = util.promisify(exec);

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

      const discoveredOthers = {};
      function dedupAdd(base, mag) {
        if (!discoveredOthers[base]) {
          discoveredOthers[base] = [mag];
        } else {
          if (discoveredOthers[base].indexOf(mag) === -1) {
            discoveredOthers[base].push(mag);
          }
        }
      }

      for (const kbinServer of kbinServers) {
        this.logPrefix = `[CrawlKBin] [${kbinServer.base}]`;

        const sketchyList = await this.getSketch(kbinServer.base);
        console.log(
          `${this.logPrefix} ver:${kbinServer.version} got magz: ${sketchyList.length}`
        );
        // return;

        await Promise.all(
          sketchyList.map(async (mag) => {
            if (mag == "") {
              console.log(`${this.logPrefix} BLANK`, mag);
              return;
            }

            // if belongs to another instance
            if (mag.indexOf("@") !== -1) {
              const split = mag.split("@");
              // console.log(`${this.logPrefix} split`, split);

              if (split.length === 2) {
                // must have two parts
                dedupAdd(split[1], split[0]);
              }
              return;
            }

            const magazineInfo = await this.getMagazineInfo(
              kbinServer.base,
              mag
            );

            if (magazineInfo.type === "Group") {
              console.log(
                `${this.logPrefix} ver:${kbinServer.version} mag: ${mag}`
                // magazineInfo
              );

              // save group
              const saveGroup = {
                title: magazineInfo.name,
                ...magazineInfo,
                name: mag,
              };

              await storage.kbin.upsert(kbinServer.base, saveGroup);
            } else {
              console.log(
                `${this.logPrefix} ver:${kbinServer.version} mag: ${mag} is not a group`,
                magazineInfo
              );
            }

            return;
          })
        );

        // await this.scanKBinInstance(kbinServer.base);
        // try {
        //   const pageData = await this.getPageData(kbinServer.base);
        //   console.log(
        //     `${this.logPrefix} Version: ${kbinServer.version} got page`,
        //     pageData
        //   );
        // } catch (e) {
        //   if (
        //     e &&
        //     e.data &&
        //     e.data["@type"] &&
        //     e.data["@type"].indexOf("hydra") !== -1
        //   ) {
        //     // remove trace
        //     delete e.data.trace;
        //     console.error(
        //       `${this.logPrefix} Version: ${kbinServer.version} error getting page /api/magazines`,
        //       e.data
        //     );
        //   } else {
        //     console.error(
        //       `${this.logPrefix} Version: ${kbinServer.version} error getting page /api/magazines`,
        //       e.data.message
        //     );
        //   }
        // }
      }
      this.logPrefix = `[CrawlKBin]`;

      // scan instance

      // create scan job for magazines
    } catch (e) {
      console.error(`${this.logPrefix} error scanning kbin instance`, e);
    }
  }

  // this calls the current method from here https://github.com/tgxn/lemmy-explorer/issues/100#issuecomment-1617444934
  async getSketch(baseUrl) {
    var currentPath = process.cwd();
    const printHelloCommand = `sh ${path.join(
      currentPath,
      "src",
      "crawl",
      "sketch.sh"
    )} ${baseUrl}`;
    const results = await execAsync(printHelloCommand);
    // console.log(results.stdout);

    const mappedArray = results.stdout.split("\n");

    if (!Array.isArray(mappedArray)) {
      throw new CrawlError("failed to get sketch", e);
    }

    return mappedArray;
  }

  async getMagazineInfo(baseUrl, magazineName) {
    console.log(
      `${this.logPrefix} getMagazineInfo`,
      "https://" + baseUrl + "/m/" + magazineName
    );
    const magazineInfo = await this.client.getUrlWithRetry(
      "https://" + baseUrl + "/m/" + magazineName,
      {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      }
    );

    return magazineInfo.data;
  }

  // async getPageData(kbinServerBase, pageNumber = 1) {
  //   // logging.debug(`${this.logPrefix} Page ${pageNumber}, Fetching...`);

  //   let communityList;
  //   try {
  //     communityList = await this.client.getUrlWithRetry(
  //       "https://" + kbinServerBase + "/api/magazines",
  //       {
  //         timeout: 3000, // smaller for nodeinfo
  //         // params: {
  //         //   type_: "Local",
  //         //   limit: 50,
  //         //   page: pageNumber,
  //         //   show_nsfw: true, // Added in 0.18.x? ish...
  //         // },
  //       },
  //       0
  //     );

  //     const communities = communityList.data;
  //     return communities;
  //   } catch (e) {
  //     throw new CrawlError("failed to get magazine list", e);
  //   }

  //   // // must be an array
  //   // if (!Array.isArray(communities)) {
  //   //   logging.trace(`${this.logPrefix}`, communityList.data);
  //   //   throw new CrawlError(`Community list not an array: ${communities}`);
  //   // }

  //   // return communities;
  // }

  // scan and check if the instance iteself is alive
  // async scanKBinInstance(kbinServerBase) {
  //   const wellKnownUrl = "https://" + kbinServerBase + "/.well-known/nodeinfo";

  //   const wellKnownInfo = await this.client.getUrlWithRetry(
  //     wellKnownUrl,
  //     {
  //       timeout: 10000, // smaller for nodeinfo
  //     },
  //     0
  //   );

  //   // logging.info("wellKnownInfo", wellKnownInfo.data);

  //   return wellKnownInfo.data;
  // }

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
