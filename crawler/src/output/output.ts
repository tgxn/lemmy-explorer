import path from "node:path";
import { readFile } from "node:fs/promises";

import removeMd from "remove-markdown";

import { OUTPUT_MAX_AGE, EXPORT_MAX_LENGTHS, PIEFED_DEV_URLS } from "../lib/const";
import logging from "../lib/logging";

import CrawlClient from "../lib/CrawlClient";

import storage from "../lib/crawlStorage";
import { IInstanceData, IInstanceDataKeyValue } from "../../../types/storage";
import { ICommunityData, ICommunityDataKeyValue } from "../../../types/storage";
import { IMagazineData, IMagazineDataKeyValue } from "../../../types/storage";
import { IPiefedCommunityData, IPiefedCommunityDataKeyValue } from "../../../types/storage";
import { IFediverseData, IFediverseDataKeyValue } from "../../../types/storage";
// import { IFediseerInstanceData } from "../lib/storage/fediseer";

import {
  IErrorData,
  IErrorDataKeyValue,
  ILastCrawlData,
  ILastCrawlDataKeyValue,
} from "../../../types/storage";
import { IUptimeNodeData, IFullUptimeData } from "../../../types/storage";

import OutputFileWriter from "./file_writer";

import {
  IMetaDataOutput,
  IInstanceDataOutput,
  IRegistrationMode,
  ICommunityDataOutput,
  IMBinInstanceOutput,
  IMBinMagazineOutput,
  IPiefedCommunityDataOutput,
  IFediverseDataOutput,
  IClassifiedErrorOutput,
} from "../../../types/output";

import OutputTrust from "./trust";

export class OutputUtils {
  static safeSplit(text: string, maxLength: number) {
    // split byu space and rejoin till above the length
    const words = text.split(" ");
    let result = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      const newString = result + " " + word;

      // if the word is too long, split it
      if (newString.length > maxLength) {
        break;
      }

      result = newString;
    }

    return result.trim();
  }

  // strip markdown, optionally substring
  static stripMarkdownSubStr(text: string, maxLength: number = -1) {
    if (!text || text.length === 0) {
      return "";
    }

    try {
      const stripped = removeMd(text);

      if (maxLength > 0) {
        return OutputUtils.safeSplit(stripped, maxLength);
      }

      return stripped.trim();
    } catch (e) {
      logging.error("error stripping markdown", text);
      throw e;
    }
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
          logging.error("error parsing publish time", lemmyFormatTime);
          publishTime = 0;
        }

        // console.log("publishTime", publishTime);
      } catch (e) {
        logging.error("error parsing publish time", lemmyFormatTime);
      }
    } else {
      logging.error("no publish time", lemmyFormatTime);
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

    logging.debug("unhandled error", errorMessage);
    return "unknown";
  }

  // ensure the output is okay for the website
  static async validateOutput(
    previousRun,
    returnInstanceArray: IInstanceDataOutput[],
    returnCommunityArray: ICommunityDataOutput[],
    mbinInstanceArray: string[],
    mbinMagazineArray: IMBinMagazineOutput[],
    piefedInstanceArray: string[],
    piefedCommunitiesArray: IPiefedCommunityDataOutput[],
    returnStats: IFediverseDataOutput[],
  ) {
    const issues: string[] = [];

    // check that there is data in all arrays
    if (
      returnInstanceArray.length === 0 ||
      returnCommunityArray.length === 0 ||
      mbinInstanceArray.length === 0 ||
      mbinMagazineArray.length === 0 ||
      piefedInstanceArray.length === 0 ||
      piefedCommunitiesArray.length === 0 ||
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

    // check if lovecraft is visible on lemmy.world
    const lovecraft = returnCommunityArray.find(
      (community) => community.url === "https://lemmy.world/c/lovecraft_mythos",
    );

    if (lovecraft) {
      // console.log("Lovecraft on Lemmy.World", lovecraft);
    } else {
      console.log("Lovecraft not on Lemmy.World");
      issues.push("Lovecraft not on Lemmy.World");
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

    data.push({
      type: "magazines",
      new: mbinMagazineArray.length,
      old: previousRun.magazines,
    });

    data.push({
      type: "mbin_instances",
      new: mbinInstanceArray.length,
      old: previousRun.mbin_instances,
    });

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

  static validateVersion(version: string): string | false {
    // strip quotation marks that come either first or last
    if (version.startsWith('"')) {
      version = version.substring(1);
    }
    if (version.endsWith('"')) {
      version = version.substring(0, version.length - 1);
    }

    // skip containing "unknown"
    if (version.includes("unknown")) {
      return false;
    }

    // skip if the value doesn't contain at least one `.` OR `-`
    if (!version.includes(".") && !version.includes("-")) {
      return false;
    }

    return version;
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

  private mbinMagazines: IMagazineData[] | null;

  private piefedCommunities: IPiefedCommunityData[] | null;

  private fileWriter: OutputFileWriter;
  private trust: OutputTrust;

  constructor() {
    this.uptimeData = null;
    this.instanceErrors = null;
    // this.communityErrors = null;

    this.instanceList = null;
    this.communityList = null;

    this.fediverseData = null;

    this.mbinMagazines = null;

    this.piefedCommunities = null;

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

    this.mbinMagazines = await storage.mbin.getAll();

    this.piefedCommunities = await storage.piefed.getAll();
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

    if (!this.mbinMagazines) {
      throw new Error("No mbin Data");
    }

    if (!this.piefedCommunities) {
      throw new Error("No piefed Data");
    }

    // setup trust data
    await this.trust.setupSources(this.instanceList);

    // delete existing data from the output directory
    await this.fileWriter.cleanData();

    let susSiteList = this.trust.getSusInstances();

    // remove sus sites not updated in 24h
    susSiteList = susSiteList.filter((instance) => {
      if (!instance.lastCrawled) return false; // record needs time

      // remove communities with age more than the max
      const recordAge = Date.now() - instance.lastCrawled;
      if (recordAge > OUTPUT_MAX_AGE.INSTANCE) {
        console.log("Sus Site has expired, the age of the record is too old", instance.base);
        return false;
      }

      return true;
    });

    await this.fileWriter.storeSuspicousData(susSiteList);

    const returnInstanceArray = await this.getInstanceArray();
    await this.fileWriter.storeInstanceData(returnInstanceArray);

    // VERSIONS DATA
    await this.outputAttributeHistory(
      returnInstanceArray.map((i) => i.baseurl),
      "version",
    );

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

    // mbin data
    const mbinInstanceArray = await this.outputMBinInstanceList(returnStats);
    const mbinMagazineArray = await this.outputMBinMagazineList();

    // piefed data
    const piefedInstanceArray = await this.outputPiefedInstanceList(returnStats);
    const piefedCommunitiesArray = await this.outputPiefedCommunitiesList();

    // error data
    const instanceErrors = await this.outputClassifiedErrors();

    // STORE RUN METADATA
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse((await readFile(packageJsonPath)).toString());

    const metaData: IMetaDataOutput = {
      instances: returnInstanceArray.length,
      communities: returnCommunityArray.length,
      mbin_instances: mbinInstanceArray.length,
      magazines: mbinMagazineArray.length,
      piefed_instances: piefedInstanceArray.length,
      piefed_communities: piefedCommunitiesArray.length,
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

    await this.fileWriter.calculateFilesizeMetrics();

    // get previous run  from current production data
    const client = new CrawlClient();
    let previousRun: any = await client.getUrl("https://lemmyverse.net/data/meta.json");
    previousRun = previousRun.data;

    console.log("Done; Total vs. Output");

    function calcChangeDisplay(current: number, previous: number) {
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

        MBinInstances: {
          ExportName: "MBin Instances",
          Total: mbinInstanceArray.length,
          Output: mbinInstanceArray.length,
          Previous: previousRun.mbin_instances,
          Change: calcChangeDisplay(mbinInstanceArray.length, previousRun.mbin_instances),
        },
        Magazines: {
          ExportName: "Magazines",
          Total: this.mbinMagazines.length,
          Output: mbinMagazineArray.length,
          Previous: previousRun.magazines,
          Change: calcChangeDisplay(mbinMagazineArray.length, previousRun.magazines),
        },

        PiefedInstances: {
          ExportName: "Piefed Instances",
          Total: piefedInstanceArray.length,
          Output: piefedInstanceArray.length,
          Previous: previousRun.piefed_instances,
          Change: calcChangeDisplay(piefedInstanceArray.length, previousRun.piefed_instances),
        },
        PiefedCommunities: {
          ExportName: "Piefed Communities",
          Total: this.piefedCommunities.length,
          Output: piefedCommunitiesArray.length,
          Previous: previousRun.piefed_communities,
          Change: calcChangeDisplay(piefedCommunitiesArray.length, previousRun.piefed_communities),
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
      mbinInstanceArray,
      mbinMagazineArray,
      piefedInstanceArray,
      piefedCommunitiesArray,
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
    const usersActiveDaySeries = await storage.instance.getAttributeWithScores(
      instance.baseurl,
      "users_active_day",
    );
    const usersActiveMonthSeries = await storage.instance.getAttributeWithScores(
      instance.baseurl,
      "users_active_month",
    );
    const usersActiveWeekSeries = await storage.instance.getAttributeWithScores(
      instance.baseurl,
      "users_active_week",
    );
    const postsSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "posts");
    const commentsSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "comments");
    const communitiesSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "communities");
    const versionSeries = await storage.instance.getAttributeWithScores(instance.baseurl, "version");

    // generate array with time -> value
    const users = usersSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });

    const usersActiveDay = usersActiveDaySeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });

    const usersActiveMonth = usersActiveMonthSeries.map((item) => {
      return {
        time: item.score,
        value: item.value,
      };
    });

    const usersActiveWeek = usersActiveWeekSeries.map((item) => {
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

    const communities = communitiesSeries.map((item) => {
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
      usersActiveDay,
      usersActiveMonth,
      usersActiveWeek,
      communities,
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

        if (!this.trust.blockedFederation) {
          throw new Error("No blocked federation data");
        }

        // incoming blocks are fetched from the trust store
        const incomingBlocks = this.trust.blockedFederation[siteBaseUrl] || 0;

        // outgoign blocks come frrom siteData
        const outgoingBlocks = instance.siteData.federated?.blocked?.length || 0;

        // console.log("outgoingBlocks", outgoingBlocks);

        const instanceTrustData = this.trust.getInstance(siteBaseUrl);

        // console.log("instanceTrustData", instanceTrustData);
        const score = instanceTrustData.score;

        // ignore instances that have no data
        const susReason = instanceTrustData.reasons;

        const admins: string[] = instance.siteData.admins.map((admin) => admin.person.actor_id);

        const regModeInt: IRegistrationMode = (() => {
          try {
            const regMode = instance.siteData.config?.registration_mode.toLowerCase();

            if (regMode === "closed") {
              return 0;
            } else if (regMode === "requireapplication") {
              return 1;
            } else if (regMode === "open") {
              return 2;
            }

            return -1;
          } catch (e) {
            console.error("error parsing registration mode", instance.siteData.config?.registration_mode);
            return -1;
          }
        })();

        // console.log("instanceTrustData.tags", instanceTrustData.tags);
        const instanceDataOut: IInstanceDataOutput = {
          baseurl: siteBaseUrl,
          url: instance.siteData.site.actor_id,
          name: instance.siteData.site.name,
          desc: OutputUtils.stripMarkdownSubStr(
            instance.siteData.site.description,
            EXPORT_MAX_LENGTHS.INSTANCE_DESC,
          ),

          // config
          downvotes: instance.siteData.config?.enable_downvotes,
          nsfw: instance.siteData.config?.enable_nsfw,
          create_admin: instance.siteData.config?.community_creation_admin_only,
          private: instance.siteData.config?.private_instance,

          reg_mode: regModeInt,

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

          admins: admins || [],
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

  private async getCommunityArray(
    returnInstanceArray: IInstanceDataOutput[],
  ): Promise<ICommunityDataOutput[]> {
    if (!this.communityList) {
      throw new Error("No community List");
    }

    let storeCommunityData: ICommunityDataOutput[] = await Promise.all(
      this.communityList.map(async (community) => {
        let siteBaseUrl = community.community.actor_id.split("/")[2];

        const score = await this.trust.calcCommunityScore(siteBaseUrl, community);

        // if (!this.instanceList) {
        //   throw new Error("No instance List");
        // }

        const relatedInstance = returnInstanceArray.find((instance) => instance.baseurl === siteBaseUrl);
        let isInstanceSus: boolean = false;
        if (relatedInstance) {
          isInstanceSus = relatedInstance.isSuspicious;
        }

        // if (siteBaseUrl.includes("zerobytes")) {
        //   console.log("siteBaseUrl", siteBaseUrl, isInstanceSus, relatedInstance);
        // }
        // const isInstanceSus: boolean = relatedInstance.isSuspicious || false; //await this.trust.getInstanceSusReasons(relatedInstance);

        // // calculate community published time
        // let publishTime = null;trust
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
          desc: OutputUtils.stripMarkdownSubStr(
            community.community.description,
            EXPORT_MAX_LENGTHS.COMMUNITY_DESC,
          ),
          icon: community.community.icon,
          banner: community.community.banner,
          nsfw: community.community.nsfw,
          counts: community.counts,
          published: OutputUtils.parseLemmyTimeToUnix(community.community?.published),
          time: community.lastCrawled || 0,

          isSuspicious: isInstanceSus,
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
      try {
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
      } catch (e) {
        console.error("error parsing error", key, value);
        throw e;
      }
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

  /// VERSION HISTORY

  private async outputAttributeHistory(
    countInstanceBaseURLs: string[],
    metricToAggregate: string,
  ): Promise<any> {
    // this function needs to output and  aghgregated array of versions, and be able to show change over time
    // this will be used to show version history on the website

    // basically, it creates a snapshot each 12 hours, and calculates the total at that point in time
    // maybe it shoudl use a floating window, so that it can show the change over time

    // anything earlier then take the latest

    // load all versions for all instances
    let aggregateDataObject: any = {};

    // console.log("countInstanceBaseURLs", countInstanceBaseURLs.length);

    const snapshotWindow = 24 * 60 * 60 * 1000; // 24 hours
    const totalWindows = 365 * 2; // 2 years

    const currentTime = Date.now();

    for (const baseURL of countInstanceBaseURLs) {
      const attributeData = await storage.instance.getAttributeWithScores(baseURL, metricToAggregate);

      // generate sliding window of x hours, look backwards

      let currentWindow = 0;
      while (currentWindow <= totalWindows) {
        // console.log("currentWindow", currentWindow);
        const windowOffset = currentWindow * snapshotWindow;

        // get this
        const windowStart = currentTime - windowOffset;
        // const windowEnd = windowStart - snapshotWindow;

        // filter data before this period
        const windowData = attributeData.filter((entry) => {
          return entry.score < windowStart;
        });
        const newestEntries = windowData.sort((a, b) => {
          return b.score - a.score;
        });

        let newestEntryValue: any = null;
        for (const thisEntry of newestEntries) {
          const value = OutputUtils.validateVersion(thisEntry.value);
          if (value) {
            newestEntryValue = value;
            break;
          }
        }

        if (!newestEntryValue) {
          currentWindow++;
          continue;
        }

        if (!aggregateDataObject[windowStart]) {
          aggregateDataObject[windowStart] = {};
        }

        if (!aggregateDataObject[windowStart][newestEntryValue]) {
          aggregateDataObject[windowStart][newestEntryValue] = 1;
        } else {
          aggregateDataObject[windowStart][newestEntryValue]++;
        }
        // console.log("newestEntryValue", newestEntryValue);

        currentWindow++;
      }
    }

    // order each sub-array by count
    for (const time in aggregateDataObject) {
      const timeData = aggregateDataObject[time];

      const orderedTimeData = Object.keys(timeData)
        .filter((key) => timeData[key] > 1)
        .sort((a, b) => {
          return timeData[b] - timeData[a];
        })
        .reduce((obj, key) => {
          obj[key] = timeData[key];
          return obj;
        }, {});

      aggregateDataObject[time] = orderedTimeData;
    }

    // look for the version in aggregateDataObject[windowStart], increment this version if it exist5s

    // console.log("windowData", aggregateDataObject);
    // throw new Error("Not Implemented");

    // map the time into each obecjt, and return as an array
    const outputVersionsArray = Object.keys(aggregateDataObject).map((time) => {
      return {
        time: time,
        ...aggregateDataObject[time],
      };
    });

    console.log("outputVersionsArray", outputVersionsArray.length);

    const acc: any = [];
    Object.values(outputVersionsArray).forEach((key: any) => {
      Object.keys(key).forEach((key) => {
        if (key !== "time" && acc.indexOf(key) === -1) {
          acc.push(key);
        }
      });
    });

    await this.fileWriter.storeMetricsSeries({
      uniqueVersions: acc.length,
      versionKeys: acc,
      versions: outputVersionsArray,
    });

    // throw new Error("Not Implemented");
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

  // mbin

  private async outputMBinInstanceList(returnStats: IFediverseDataOutput[]): Promise<string[]> {
    let mbinInstanceUrls: string[] = returnStats
      .map((fediverse) => {
        // const fediverse = this.fediverseData[fediKey];

        if (fediverse.software && fediverse.software === "mbin") {
          return fediverse.url;
        }

        return null;
      })
      .filter((instance) => instance !== null);

    await this.fileWriter.storeMBinInstanceData(mbinInstanceUrls);

    return mbinInstanceUrls;
  }

  private async outputMBinMagazineList(): Promise<IMBinMagazineOutput[]> {
    const output: IMBinMagazineOutput[] = [];

    if (!this.mbinMagazines) {
      throw new Error("No MBin data");
    }

    // filter old data
    const filteredMBins = this.mbinMagazines.filter((mbin) => {
      if (!mbin.lastCrawled) return false; // record needs time
      return mbin.lastCrawled > Date.now() - OUTPUT_MAX_AGE.MAGAZINE;
    });

    logging.info("MBin Magazines filteredMBins", this.mbinMagazines.length, filteredMBins.length);

    for (const mbin of filteredMBins) {
      output.push({
        baseurl: mbin.baseurl,
        magazineId: mbin.magazineId,

        title: mbin.title, // display name
        name: mbin.name, // key username
        // preferred: mbin.preferredUsername, // username ??

        description: OutputUtils.stripMarkdownSubStr(mbin.description, EXPORT_MAX_LENGTHS.MAGAZINE_DESC),
        isAdult: mbin.isAdult,
        postingRestrictedToMods: mbin.isPostingRestrictedToMods,

        icon: mbin.icon?.storageUrl ? mbin.icon.storageUrl : null,
        // published: mbin.published,
        // updated: mbin.updated,
        subscriptions: mbin.subscriptionsCount,
        posts: mbin.postCount,

        time: mbin.lastCrawled || 0,
      });
    }

    await this.fileWriter.storeMBinMagazineData(output);

    return output;
  }

  // piefed

  private async outputPiefedInstanceList(returnStats: IFediverseDataOutput[]): Promise<string[]> {
    let piefedInstanceUrls: string[] = returnStats
      .map((fediverse) => {
        // const fediverse = this.fediverseData[fediKey];

        if (fediverse.software && fediverse.software === "piefed") {
          return fediverse.url;
        }

        return null;
      })
      .filter((instance) => instance !== null);

    await this.fileWriter.storePiefedInstanceData(piefedInstanceUrls);

    return piefedInstanceUrls;
  }

  private async outputPiefedCommunitiesList(): Promise<IPiefedCommunityDataOutput[]> {
    const output: IPiefedCommunityDataOutput[] = [];

    if (!this.piefedCommunities) {
      throw new Error("No Piefed data");
    }

    // filter old data
    const filteredPiefeds = this.piefedCommunities.filter((piefedComm) => {
      if (!piefedComm.lastCrawled) return false; // record needs time
      return piefedComm.lastCrawled > Date.now() - OUTPUT_MAX_AGE.COMMUNITY;
    });

    logging.info("Piefed Communities filteredPiefeds", this.piefedCommunities.length, filteredPiefeds.length);

    // filter out known dev instances
    const devInstacesRemovedPiefeds = filteredPiefeds.filter((piefedComm) => {
      return !PIEFED_DEV_URLS.includes(piefedComm.community.ap_domain);
    });

    logging.info(
      "Piefed Communities devInstacesRemovedPiefeds",
      filteredPiefeds.length,
      devInstacesRemovedPiefeds.length,
    );

    for (const piefed of devInstacesRemovedPiefeds) {
      output.push({
        baseurl: piefed.baseurl,
        name: piefed.community.name, // key username
        title: piefed.community.title, // display name
        icon: piefed.community?.icon ? piefed.community.icon : null,
        nsfw: piefed.community.nsfw,
        subscriptions_count: piefed.counts.subscriptions_count,
        post_count: piefed.counts.post_count,
        published: piefed.community.published,
        time: piefed.lastCrawled || 0,
        restricted_to_mods: piefed.community.restricted_to_mods,
        description: piefed.community.description,
      });
    }

    await this.fileWriter.storePiefedCommunityData(output);

    return output;
  }
}
