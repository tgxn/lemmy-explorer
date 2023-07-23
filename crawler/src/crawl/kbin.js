import logging from "../lib/logging.js";

import storage from "../storage.js";

import { CrawlError, CrawlTooRecentError } from "../lib/error.js";

import KBinQueue from "../queue/kbin.js";
import InstanceQueue from "../queue/instance.js";

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

    this.instanceQueue = new InstanceQueue(false);

    this.client = new AxiosClient();
  }

  // scan the full list of fediverse marked instances with "kbin"
  async createJobsAllKBin() {
    try {
      // get all fedi kbin servers
      const kbinServers = await this.getKBin();
      logging.info(`KBin Instances Total: ${kbinServers.length}`);

      const kbinQueue = new KBinQueue(false);
      for (const kbinServer of kbinServers) {
        this.logPrefix = `[CrawlKBin] [${kbinServer.base}]`;
        console.log(`${this.logPrefix} create job ${kbinServer.base}`);

        await kbinQueue.createJob(kbinServer.base);
      }
    } catch (e) {
      console.error(`${this.logPrefix} error scanning kbin instance`, e);
    }
  }

  // scan a single kbin instance's magazines
  async processOneInstance(kbinBaseUrl) {
    let sketchyList = await this.getSketch(kbinBaseUrl);
    sketchyList = sketchyList.filter((mag) => mag != "");
    // fix spaces
    sketchyList = sketchyList.map((mag) => {
      if (mag.indexOf(" ") !== -1) {
        return mag.split(" ")[0];
      }
      return mag;
    });

    const localMagazines = sketchyList.filter((mag) => {
      if (mag.indexOf("@") !== -1) {
        return false;
      }
      return true;
    });

    const nonLocalMagazines = sketchyList.filter((mag) => {
      if (mag.indexOf("@") !== -1) {
        return true;
      }
      return false;
    });

    console.log(
      `${this.logPrefix} [${kbinBaseUrl}] local: ${localMagazines.length} others: ${nonLocalMagazines.length} `
    );

    if (localMagazines.length > 0) {
      for (const mag of localMagazines) {
        try {
          // check for recent scan of this magazine
          const lastCrawlTs = await storage.tracking.getLastCrawl(
            "magazine",
            `${kbinBaseUrl}:${mag}`
          );
          if (lastCrawlTs) {
            const lastCrawledMsAgo = Date.now() - lastCrawlTs;
            throw new CrawlTooRecentError(
              `Skipping - Crawled too recently (${
                lastCrawledMsAgo / 1000
              }s ago)`
            );
          }

          await this.getStoreMag(kbinBaseUrl, mag);
        } catch (e) {
          console.error(
            `${this.logPrefix} error scanning kbin MAG`,
            kbinBaseUrl,
            mag,
            e.message
          );
        }
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // create kbin job to scan non-local baseurls
    if (nonLocalMagazines.length > 0) {
      // const kbinQueue = new KBinQueue(false);
      for (const otherName of nonLocalMagazines) {
        // console.log(`${this.logPrefix} otherName`, otherName);

        const split = otherName.split("@");
        // console.log(`${this.logPrefix} split`, split);

        if (split.length === 2) {
          // must have two parts, we only want the second bit after the @
          // add to the instance queue to validate it is a kbin instance
          await this.instanceQueue.createJob(split[1]);
        }
      }
    }

    return;
  }

  async getStoreMag(kbinBaseUrl, mag) {
    const magazineInfo = await this.getMagazineInfo(kbinBaseUrl, mag);

    if (magazineInfo.type === "Group") {
      const followerData = await this.getFollowupData(magazineInfo.followers);
      const followers = followerData.totalItems;

      console.log(`got followers`, followers);

      // save group
      const saveGroup = {
        baseurl: kbinBaseUrl,
        followerCount: followers,
        title: magazineInfo.name,

        // name must overide the name from the api
        ...magazineInfo,
        name: mag,
      };
      await storage.kbin.upsert(kbinBaseUrl, saveGroup);
      await storage.tracking.setLastCrawl("magazine", `${kbinBaseUrl}:${mag}`);

      logging.info(`${this.logPrefix} mag: ${mag} Saved KBin Magazine`);
    } else {
      console.log(`${this.logPrefix} mag: ${mag} is not a group`, magazineInfo);
    }

    return;
  }

  // this calls the current method from here https://github.com/tgxn/lemmy-explorer/issues/100#issuecomment-1617444934
  async getSketch(baseUrl) {
    var currentPath = process.cwd();
    const printHelloCommand = `/bin/bash ${path.join(
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

  // uses non-documented api on instances to get a json list of all kbin magazine data
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
      },
      1
    );

    return magazineInfo.data;
  }

  async getFollowupData(wellKnownUrl) {
    const wellKnownInfo = await this.client.getUrlWithRetry(
      wellKnownUrl,
      {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      },
      3
    );
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
