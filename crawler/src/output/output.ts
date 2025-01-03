import { readFile } from "node:fs/promises";

import removeMd from "remove-markdown";

import { OUTPUT_MAX_AGE } from "../lib/const";
import logging from "../lib/logging";

import CrawlClient from "../lib/CrawlClient";

import storage from "../lib/crawlStorage";
import { IInstanceData, IInstanceDataKeyValue } from "../lib/storage/instance";
import { ICommunityData, ICommunityDataKeyValue } from "../lib/storage/community";
import { IMagazineData, IMagazineDataKeyValue } from "../lib/storage/kbin";
import { IFediverseData, IFediverseDataKeyValue } from "../lib/storage/fediverse";
import { IFediseerData } from "../lib/storage/fediseer";
import {
  IErrorData,
  IErrorDataKeyValue,
  ILastCrawlData,
  ILastCrawlDataKeyValue,
} from "../lib/storage/tracking";
import { IUptimeNodeData, IFullUptimeData } from "../lib/storage/uptime";

import OutputFileWriter from "./file_writer";
import OutputTrust from "./trust";

export type IKBinMagazineOutput = {
  actor_id: string;
  title: string;
  name: string;
  preferred: string;
  baseurl: string;
  summary: string;
  sensitive: boolean;
  postingRestrictedToMods: boolean;
  icon: string;
  published: string;
  updated: string;
  followers: number;
  time: number;
};

export type IFediverseDataOutput = {
  url: string;
  software: string;
  version: string;
};

export type IClassifiedErrorOutput = {
  baseurl: string;
  time: number;
  error: string;
  type?: string;
};

export type ICommunityDataOutput = {
  baseurl: string;
  url: string;
  name: string;
  title: string;
  desc: string;
  icon: string | null;
  banner: string | null;
  nsfw: boolean;
  counts: Object;
  published: number;
  time: number;
  isSuspicious: boolean;
  score: number;
};

export type IInstanceDataOutput = {
  baseurl: string;
  url: string;
  name: string;
  desc: string;
  downvotes: boolean;
  nsfw: boolean;
  create_admin: boolean;
  private: boolean;
  fed: boolean;
  version: string;
  open: boolean;
  usage: number;
  counts: Object;
  icon: string;
  banner: string;
  langs: string[];
  date: string;
  published: number;
  time: number;
  score: number;
  uptime?: IUptimeNodeData;
  isSuspicious: boolean;
  metrics: Object | null;
  tags: string[];
  susReason: string[];
  trust: Object;
  blocks: {
    incoming: number;
    outgoing: number;
  };
  blocked: string[];
};

class OutputUtils {
  // strip markdown, optionally substring
  static stripMarkdownSubStr(text: string, maxLength: number = -1) {
    const stripped = removeMd(text);

    if (maxLength > 0) {
      return stripped.substring(0, maxLength);
    }

    return stripped;
  }

  // calculate community published time epoch
  static parseLemmyTimeToUnix(lemmyFormatTime: string): number {
    let publishTime: number = 0;

    if (lemmyFormatTime) {
      try {
        // why do some instances have Z on the end -.-
        publishTime = new Date(lemmyFormatTime.replace(/(\.\d{6}Z?)/, "Z")).getTime();

        // if not a number
        if (isNaN(publishTime)) {
          console.error("error parsing publish time", lemmyFormatTime);
          publishTime = 0;
        }

        // console.log("publishTime", publishTime);
      } catch (e) {
        console.error("error parsing publish time", lemmyFormatTime);
      }
    } else {
      console.error("no publish time", lemmyFormatTime);
    }

    return publishTime;
  }

  // given an error message from redis, figure out what it relates to..
  static findErrorType(errorMessage: string): string {
    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("EAI_AGAIN") ||
      errorMessage.includes("socket hang up") ||
      errorMessage.includes("Client network socket disconnected")
    ) {
      return "connectException";
    }

    if (errorMessage.includes("timeout of")) {
      return "timeout";
    }

    if (
      errorMessage.includes("self-signed certificate") ||
      errorMessage.includes("does not match certificate's altnames") ||
      errorMessage.includes("tlsv1 unrecognized name") ||
      errorMessage.includes("tlsv1 alert internal error") ||
      errorMessage.includes("ssl3_get_record:wrong version number") ||
      errorMessage.includes("unable to verify the first certificate") ||
      errorMessage.includes("unable to get local issuer certificate") ||
      errorMessage.includes("certificate has expired")
    ) {
      return "sslException";
    }

    if (errorMessage.includes("baseUrl is not a valid domain")) {
      return "invalidBaseUrl";
    }

    if (
      errorMessage.includes("code 300") ||
      errorMessage.includes("code 400") ||
      errorMessage.includes("code 403") ||
      errorMessage.includes("code 404") ||
      errorMessage.includes("code 406") ||
      errorMessage.includes("code 410") ||
      errorMessage.includes("code 500") ||
      errorMessage.includes("code 502") ||
      errorMessage.includes("code 503") ||
      errorMessage.includes("code 520") ||
      errorMessage.includes("code 521") ||
      errorMessage.includes("code 523") ||
      errorMessage.includes("code 525") ||
      errorMessage.includes("code 526") ||
      errorMessage.includes("code 530") ||
      errorMessage.includes("Maximum number of redirects exceeded")
    ) {
      return "httpException";
    }

    if (
      errorMessage.includes("no diaspora rel in") ||
      errorMessage.includes("wellKnownInfo.data.links is not iterable") ||
      errorMessage.includes("missing /.well-known/nodeinfo links")
    ) {
      return "httpException";
    }

    if (errorMessage.includes("not a lemmy instance")) {
      return "notLemmy";
    }

    if (
      errorMessage.includes("invalid actor id") ||
      errorMessage.includes("actor id does not match instance domain")
    ) {
      return "invalidActorId";
    }

    logging.silly("unhandled error", errorMessage);
    return "unknown";
  }

  // ensure the output is okay for the website
  static async validateOutput(
    previousRun,
    returnInstanceArray,
    returnCommunityArray,
    kbinInstanceArray,
    kbinMagazineArray,
    returnStats,
  ) {
    const issues: string[] = [];

    // check that there is data in all arrays
    if (
      returnInstanceArray.length === 0 ||
      returnCommunityArray.length === 0 ||
      kbinInstanceArray.length === 0 ||
      kbinMagazineArray.length === 0 ||
      returnStats.length === 0
    ) {
      console.log("Empty Array");
      issues.push("Empty Array(s)");
    }

    // check for duplicate baseurls
    for (let i = 0; i < returnInstanceArray.length; i++) {
      const instance = returnInstanceArray[i];

      const found = returnInstanceArray.find((i) => i.baseurl === instance.baseurl);

      if (found && found !== instance) {
        console.log("Duplicate Instance", instance.baseurl);
        issues.push("Duplicate Instance: " + instance.baseurl);
      }
    }

    // check values are < 10% different
    const checkChangeIsValid = (value, previousValue, pct = 15) => {
      if (!value || !previousValue) {
        return false;
      }

      const diff = Math.abs(value - previousValue);
      const percent = (diff / previousValue) * 100;

      if (percent > pct) {
        console.log("Percent Diff", value, previousValue, percent);
        return false;
      }

      return true;
    };

    // check that the output is not too different from the previous run
    const data: any = [];
    data.push({
      type: "instances",
      new: returnInstanceArray.length,
      old: previousRun.instances,
    });

    // check that community counts haven't changed heaps
    data.push({
      type: "communities",
      new: returnCommunityArray.length,
      old: previousRun.communities,
    });

    data.push({
      type: "fediverse",
      new: returnStats.length,
      old: previousRun.fediverse,
    });

    // @TODO kbin checks are disabled till scanning is fixed
    // data.push({
    //   type: "magazines",
    //   new: kbinMagazineArray.length,
    //   old: previousRun.magazines,
    // });
    // data.push({
    //   type: "kbin_instances",
    //   new: kbinInstanceArray.length,
    //   old: previousRun.kbin_instances,
    // });

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // TEMP skip if there are more items in the new payload
      if (item.new > item.old) {
        return;
      }

      const isValid = checkChangeIsValid(item.new, item.old);

      if (!isValid) {
        console.log("Percent Diff", item.type, item.new, item.old);
        issues.push("Percent Diff: " + item.type);
      }
    }

    if (issues.length > 0) {
      console.log("Validation Issues", issues);

      throw new Error("Validation Issues: " + issues.join(", "));
    }

    return true;
  }
}

/**
 * this generates the .json files for the frontend /public folder
 * it conencts to redis and pulls lists of all the data we have stored
 */
export default class CrawlOutput {
  private uptimeData: IFullUptimeData | null;
  private instanceErrors: IErrorDataKeyValue | null;

  private instanceList: IInstanceData[] | null;
  private communityList: ICommunityData[] | null;
  private fediverseData: IFediverseDataKeyValue | null;
  private kbinData: IMagazineData[] | null;

  private fileWriter: OutputFileWriter;
  private trust: OutputTrust;

  constructor() {
    this.uptimeData = null;
    this.instanceErrors = null;
    // this.communityErrors = null;
    this.instanceList = null;
    this.communityList = null;
    this.fediverseData = null;
    this.kbinData = null;

    // this.utils = new OutputUtils();

    this.fileWriter = new OutputFileWriter();
    this.trust = new OutputTrust();
  }

  // load all required data from redis
  async loadAllData() {
    this.uptimeData = await storage.uptime.getLatest();
    this.instanceErrors = await storage.tracking.getAllErrors("instance");
    // this.communityErrors = await storage.tracking.getAllErrors("community");
    this.instanceList = await storage.instance.getAll();
    this.communityList = await storage.community.getAll();
    this.fediverseData = await storage.fediverse.getAll();
    this.kbinData = await storage.kbin.getAll();
  }

  /**
   * Main Output Generation Script
   */
  async start() {
    await this.loadAllData();

    if (!this.instanceList) {
      throw new Error("No instance List");
    }

    if (!this.communityList) {
      throw new Error("No community List");
    }

    if (!this.fediverseData) {
      throw new Error("No fediverse Data");
    }

    if (!this.kbinData) {
      throw new Error("No kbin Data");
    }

    // setup trust data
    await this.trust.setupSources(this.instanceList);

    // delete existing data from the output directory
    await this.fileWriter.cleanData();

    const susSiteList = this.trust.getSusInstances();
    await this.fileWriter.storeSuspicousData(susSiteList);

    const returnInstanceArray = await this.getInstanceArray();
    await this.fileWriter.storeInstanceData(returnInstanceArray);

    const returnCommunityArray = await this.getCommunityArray(returnInstanceArray);
    await this.fileWriter.storeCommunityData(returnCommunityArray);

    // generate instance-level metrics `instance.com.json` for each instance
    await Promise.all(
      returnInstanceArray.map(async (instance) => {
        return this.generateInstanceMetrics(instance, returnCommunityArray);
      }),
    );

    // fediverse data
    const returnStats = await this.outputFediverseData(returnInstanceArray);

    // kbin data
    const kbinInstanceArray = await this.outputKBinInstanceList(returnStats);
    const kbinMagazineArray = await this.outputKBinMagazineList();

    // error data
    const instanceErrors = await this.outputClassifiedErrors();

    // STORE RUN METADATA
    const packageJson = JSON.parse(
      (await readFile(new URL("../../package.json", import.meta.url))).toString(),
    );

    const metaData = {
      instances: returnInstanceArray.length,
      communities: returnCommunityArray.length,
      kbin_instances: kbinInstanceArray.length,
      magazines: kbinMagazineArray.length,
      // kbin_instances: kbinInstanceArray.length,
      fediverse: returnStats.length,
      time: Date.now(),
      package: packageJson.name,
      version: packageJson.version,

      // top 10 linked, allowed, blocked domains
      // sort by count of times seen on each list
      linked: this.trust.linkedFederation,
      allowed: this.trust.allowedFederation,
      blocked: this.trust.blockedFederation,
    };
    await this.fileWriter.storeMetaData(metaData);

    // get previous run  from current production data
    const client = new CrawlClient();
    let previousRun: any = await client.getUrl("https://lemmyverse.net/data/meta.json");
    previousRun = previousRun.data;

    console.log("Done; Total vs. Output");

    function calcChangeDisplay(current, previous) {
      return `${current > previous ? "+" : ""}${current - previous} (${(
        ((current - previous) / previous) *
        100
      ).toFixed(2)}%)`;
    }

    console.table(
      {
        Instances: {
          ExportName: "Instances",
          Total: this.instanceList.length,
          Output: returnInstanceArray.length,
          Previous: previousRun.instances,
          Change: calcChangeDisplay(returnInstanceArray.length, previousRun.instances),
        },
        Communities: {
          ExportName: "Communities",
          Total: this.communityList.length,
          Output: returnCommunityArray.length,
          Previous: previousRun.communities,
          Change: calcChangeDisplay(returnCommunityArray.length, previousRun.communities),
        },
        KBinInstances: {
          ExportName: "KBin Instances",
          Total: "N/A",
          Output: kbinInstanceArray.length,
          Previous: previousRun.kbin_instances,
          Change: calcChangeDisplay(kbinInstanceArray.length, previousRun.kbin_instances),
        },
        Magazines: {
          ExportName: "Magazines",
          Total: this.kbinData.length,
          Output: kbinMagazineArray.length,
          Previous: previousRun.magazines,
          Change: calcChangeDisplay(kbinMagazineArray.length, previousRun.magazines),
        },
        Fediverse: {
          ExportName: "Fediverse Servers",
          Total: "N/A",
          Output: returnStats.length,
          Previous: previousRun.fediverse,
          Change: calcChangeDisplay(returnStats.length, previousRun.fediverse),
        },
        ErrorData: {
          ExportName: "Error Data",
          Total: "N/A",
          Output: instanceErrors.length,
        },
        SusSites: {
          ExportName: "Sus Sites",
          Total: "N/A",
          Output: susSiteList.length,
        },
      },
      ["Total", "Output", "Previous", "Change"],
    );

    const validateOutput = await OutputUtils.validateOutput(
      previousRun,
      returnInstanceArray,
      returnCommunityArray,
      kbinInstanceArray,
      kbinMagazineArray,
      returnStats,
    );

    return validateOutput;
  }

  /// find updatenode for given baseurl
  private getBaseUrlUptime(baseUrl: string) {
    if (!this.uptimeData) {
      throw new Error("No uptime Data");
    }

    const foundKey = this.uptimeData.nodes.find((k) => k.domain == baseUrl);
    return foundKey;
  }

  // find a failure for a given baseurl
  private findFail(baseUrl: string): IErrorData | null {
    const keyName = `error:instance:${baseUrl}`;

    if (!this.instanceErrors) {
      throw new Error("No instance Errors");
    }

    const matchingKey = Object.keys(this.instanceErrors).find((k) => k === keyName);
    if (matchingKey) {
      return this.instanceErrors[matchingKey];
    }

    return null;
  }

  private async generateInstanceMetrics(instance, storeCommunityData) {
    // get timeseries
    const usersSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "users");
    const postsSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "posts");
    const commentsSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "comments");
    const versionSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "version");

    // generate array with time -> value
    const users = usersSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });
    const posts = postsSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });
    const comments = commentsSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });
    const versions = versionSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });

    await this.fileWriter.storeInstanceMetricsData(instance.baseurl, {
      instance,
      communityCount: storeCommunityData.filter((community) => community.baseurl === instance.baseurl).length,
      users,
      posts,
      comments,
      versions,
    });
  }

  // INSTANCES

  private async getInstanceArray(): Promise<IInstanceDataOutput[]> {
    if (!this.instanceList) {
      throw new Error("No instance List");
    }

    let storeData: IInstanceDataOutput[] = await Promise.all(
      this.instanceList.map(async (instance) => {
        if (!instance.siteData?.site?.actor_id) {
          logging.error("no actor_id", instance);
          throw new Error("no actor_id");
        }

        let siteBaseUrl = instance.siteData.site.actor_id.split("/")[2];

        const siteUptime = this.getBaseUrlUptime(siteBaseUrl);

        const incomingBlocks = this.trust.blockedFederation[siteBaseUrl] || 0;
        const outgoingBlocks = instance.siteData.federated?.blocked?.length || 0;

        const instanceTrustData = this.trust.getInstance(siteBaseUrl);

        const score = instanceTrustData.score;

        // ignore instances that have no data
        const susReason = instanceTrustData.reasons;

        // console.log("instanceTrustData.tags", instanceTrustData.tags);
        const instanceDataOut: IInstanceDataOutput = {
          baseurl: siteBaseUrl,
          url: instance.siteData.site.actor_id,
          name: instance.siteData.site.name,
          desc: OutputUtils.stripMarkdownSubStr(instance.siteData.site.description, 350),

          // config
          downvotes: instance.siteData.config?.enable_downvotes,
          nsfw: instance.siteData.config?.enable_nsfw,
          create_admin: instance.siteData.config?.community_creation_admin_only,
          private: instance.siteData.config?.private_instance,
          fed: instance.siteData.config?.federation_enabled,

          version: instance.nodeData.software.version,
          open: instance.nodeData.openRegistrations,

          usage: instance.nodeData.usage, // TO BE DEPRECATED
          counts: instance.siteData.counts, // USE THIS INSTEAD

          icon: instance.siteData.site.icon,
          banner: instance.siteData.site.banner,
          langs: instance.langs,

          date: instance.siteData.site.published, // TO BE DEPRECATED
          published: OutputUtils.parseLemmyTimeToUnix(instance.siteData?.site?.published),

          time: instance.lastCrawled || 0,
          score: score,
          uptime: siteUptime,

          isSuspicious: susReason.length > 0 ? true : false,
          metrics: instanceTrustData.metrics || null,
          tags: instanceTrustData.tags || [],
          susReason: susReason,

          trust: instanceTrustData,

          blocks: {
            incoming: incomingBlocks,
            outgoing: outgoingBlocks,
          },
          blocked: instance.siteData.federated?.blocked || [],
        };

        return instanceDataOut;
      }),
    );

    // add trust
    // await this.trust.setAllInstancesWithMetrics(storeData);

    // const trustData = await this.trust.calcInstanceDeviation();

    // storeData = await Promise.all(
    //   storeData.map(async (instance) => {
    //     const trustData = await this.trust.scoreInstance(instance.baseurl);

    //     return {
    //       ...instance,
    //       trust: trustData,
    //     };
    //   })
    // );

    // remove those with errors that happened before time
    storeData = storeData.filter((instance) => {
      if (instance == null) return false; // take out skipped

      const fail = this.findFail(instance.baseurl);
      if (fail) {
        if (instance.time < fail.time) {
          // logging.info("filtered due to fail", instance.baseurl, fail.error);
          return false;
        }
      }
      return true;
    });

    // remove instances not updated in 24h
    storeData = storeData.filter((instance) => {
      if (!instance.time) return false; // record needs time

      // remove communities with age more than the max
      const recordAge = Date.now() - instance.time;
      if (recordAge > OUTPUT_MAX_AGE.INSTANCE) {
        return false;
      }

      return true;
    });

    // filter blank
    storeData = storeData.filter((instance) => instance.url !== "" || instance.name !== "");

    // logging.info(
    //   `Instances ${this.instanceList.length} -> ${storeData.length}`
    // );

    return storeData;
  }

  // COMMUNITY

  private async getCommunityArray(returnInstanceArray): Promise<ICommunityDataOutput[]> {
    if (!this.communityList) {
      throw new Error("No community List");
    }

    let storeCommunityData: ICommunityDataOutput[] = await Promise.all(
      this.communityList.map(async (community) => {
        let siteBaseUrl = community.community.actor_id.split("/")[2];

        const score = await this.trust.calcCommunityScore(siteBaseUrl, community);

        if (!this.instanceList) {
          throw new Error("No instance List");
        }

        const relatedInstance = this.instanceList.find(
          (instance) => instance.siteData.site.actor_id.split("/")[2] === siteBaseUrl,
        );
        const isInstanceSus = await this.trust.getInstanceSusReasons(relatedInstance);

        // // calculate community published time
        // let publishTime = null;
        // if (community.community.published) {
        //   try {
        //     // why do some instances have Z on the end -.-
        //     publishTime = new Date(
        //       community.community.published.replace(/(\.\d{6}Z?)/, "Z")
        //     ).getTime();

        //     // if not a number
        //     if (isNaN(publishTime)) {
        //       console.error(
        //         "error parsing publish time",
        //         community.community.published
        //       );
        //       publishTime = null;
        //     }

        //     // console.log("publishTime", publishTime);
        //   } catch (e) {
        //     console.error(
        //       "error parsing publish time",
        //       community.community.published
        //     );
        //   }
        // } else {
        //   console.error("no publish time", community.community);
        // }

        const communityDataOutput: ICommunityDataOutput = {
          baseurl: siteBaseUrl,
          url: community.community.actor_id,
          name: community.community.name,
          title: community.community.title,
          desc: OutputUtils.stripMarkdownSubStr(community.community.description, 350),
          icon: community.community.icon,
          banner: community.community.banner,
          nsfw: community.community.nsfw,
          counts: community.counts,
          published: OutputUtils.parseLemmyTimeToUnix(community.community?.published),
          time: community.lastCrawled || 0,

          isSuspicious: isInstanceSus.length > 0 ? true : false,
          score: score,
        };

        return communityDataOutput;
      }),
    );

    // remove those with errors that happened before updated time
    let preFilterFails = storeCommunityData.length;
    storeCommunityData = storeCommunityData.filter((community) => {
      const fail = this.findFail(community.baseurl);
      if (fail) {
        if (community.time < fail.time) {
          // logging.info("filtered due to fail", fail, community.baseurl);
          return false;
        }
      }
      return true;
    });
    console.log(`Filtered ${preFilterFails - storeCommunityData.length} fails`);

    // remove communities not updated in 24h
    let preFilterAge = storeCommunityData.length;
    storeCommunityData = storeCommunityData.filter((community) => {
      if (!community.time) {
        console.log("no time", community);
        return false; // record needs time
      }

      // remove communities with age more than the max
      const recordAge = Date.now() - community.time;

      // if (recordAge < OUTPUT_MAX_AGE.COMMUNITY && community.nsfw) {
      //   console.log("NFSW Updated Recently!!", community.url);
      //   // return false;
      // }

      // temp fix till lermmy allows querying nsfw on the public api -.-
      if (community.nsfw) {
        return true;
      }

      if (recordAge > OUTPUT_MAX_AGE.COMMUNITY) {
        return false;
      }

      return true;
    });
    console.log(`Filtered ${preFilterAge - storeCommunityData.length} age`);

    // remove those not being in the instance list
    if (returnInstanceArray) {
      let preFilterInstance = storeCommunityData.length;
      storeCommunityData = storeCommunityData.filter((community) => {
        const relatedInstance = returnInstanceArray.find(
          (instance) => instance.baseurl === community.baseurl,
        );

        if (!relatedInstance) {
          // logging.info(
          //   "filtered due to no instance",
          //   community.baseurl,
          //   community.url
          // );
          return false;
        }

        return true;
      });
      console.log(`Filtered ${preFilterInstance - storeCommunityData.length} NO_instance`);
    }

    // filter blank
    storeCommunityData = storeCommunityData.filter(
      (community) => community.url !== "" || community.name !== "" || community.title !== "",
    );

    // logging.info(
    //   `Communities ${this.communityList.length} -> ${storeCommunityData.length}`
    // );

    return storeCommunityData;
  }

  // ERRORS

  private async outputClassifiedErrors(): Promise<IClassifiedErrorOutput[]> {
    let instanceErrors: IClassifiedErrorOutput[] = [];

    if (!this.instanceErrors) {
      throw new Error("No instance Errors");
    }

    // key value in errors
    let errorTypes = {};
    for (const [key, value] of Object.entries(this.instanceErrors)) {
      const instanceData: IClassifiedErrorOutput = {
        baseurl: key.replace("error:instance:", ""),
        error: value.error,
        time: value.time,
      };
      instanceData.type = OutputUtils.findErrorType(value.error);

      if (errorTypes[instanceData.type] === undefined) {
        errorTypes[instanceData.type] = 0;
      } else {
        errorTypes[instanceData.type]++;
      }

      instanceErrors.push(instanceData);
    }

    // count each type
    // let errorTypes = {};
    // instanceErrors.forEach((instance) => {
    //   console.log("instance", instance);
    //   if (!errorTypes[instance.type]) {
    //     errorTypes[instance.type] = 0;
    //   } else {
    //     errorTypes[instance.type]++;
    //   }
    // });

    console.log("Error Types by Count");
    console.table(errorTypes);

    logging.debug("instanceErrors", instanceErrors.length, errorTypes);

    await this.fileWriter.storeInstanceErrors(instanceErrors);

    return instanceErrors;
  }

  // FEDIVERSE

  private async outputFediverseData(outputInstanceData): Promise<IFediverseDataOutput[]> {
    let returnStats: IFediverseDataOutput[] = [];

    let softwareNames = {};
    let softwareBaseUrls = {};

    if (!this.fediverseData) {
      throw new Error("No fediverse Data");
    }

    for (const [fediKey, fediValue] of Object.entries(this.fediverseData)) {
      // const fediverse = this.fediverseData[fediKey];

      const baseUrl = fediKey.replace("fediverse:", "");
      if (fediValue.name) {
        if (!softwareBaseUrls[fediValue.name]) {
          softwareBaseUrls[fediValue.name] = [baseUrl];
        } else {
          softwareBaseUrls[fediValue.name].push(baseUrl);
        }

        if (!softwareNames[fediValue.name]) {
          softwareNames[fediValue.name] = 1;
        } else {
          softwareNames[fediValue.name] += 1;
        }

        returnStats.push({
          url: baseUrl,
          software: fediValue.name,
          version: fediValue.version || "",
        });
      }
    }

    // count total tags in instance array and output tags meta file
    let tagCounts: { tag: string; count: number }[] = []; // { tag: "name", count: 0 }
    outputInstanceData.forEach((instance) => {
      instance.tags.forEach((tag) => {
        const foundTag = tagCounts.find((t) => t.tag === tag);
        if (foundTag) {
          foundTag.count++;
        } else {
          tagCounts.push({ tag: tag, count: 1 });
        }
      });

      // add tags to software
    });

    // sort tags by count
    tagCounts = tagCounts.sort((a, b) => {
      return b.count - a.count;
    });

    await this.fileWriter.storeFediverseData(returnStats, softwareNames, softwareBaseUrls, tagCounts);

    return returnStats;
  }

  // KBIN

  private async outputKBinInstanceList(returnStats: IFediverseDataOutput[]): Promise<string[]> {
    let kbinInstanceUrls: string[] = returnStats
      .map((fediverse) => {
        // const fediverse = this.fediverseData[fediKey];

        if (fediverse.software && fediverse.software === "kbin") {
          return fediverse.url;
        }

        return null;
      })
      .filter((instance) => instance !== null);

    await this.fileWriter.storeKbinInstanceList(kbinInstanceUrls);

    return kbinInstanceUrls;
  }

  // generate a list of all the instances that are suspicious and the reasons
  private async outputKBinMagazineList(): Promise<IKBinMagazineOutput[]> {
    const output: IKBinMagazineOutput[] = [];

    if (!this.kbinData) {
      throw new Error("No KBin data");
    }

    // filter old data
    const filteredKBins = this.kbinData.filter((kbin) => {
      return kbin.lastCrawled > Date.now() - OUTPUT_MAX_AGE.MAGAZINE;
    });

    logging.info("KBin Magazines filteredKBins", this.kbinData.length, filteredKBins.length);

    for (const kbin of filteredKBins) {
      output.push({
        actor_id: kbin.id,

        title: kbin.title, // display name
        name: kbin.name, // key username
        preferred: kbin.preferredUsername, // username ??

        baseurl: kbin.id.split("/")[2],

        summary: OutputUtils.stripMarkdownSubStr(kbin.summary, 350),
        sensitive: kbin.sensitive,
        postingRestrictedToMods: kbin.postingRestrictedToMods,

        icon: kbin.icon ? kbin.icon.url : null,
        published: kbin.published,
        updated: kbin.updated,
        followers: kbin.followerCount,

        time: kbin.lastCrawled || 0,
      });
    }

    await this.fileWriter.storeKBinMagazineData(output);

    return output;
  }
}