import removeMd from "remove-markdown";

import logging from "../lib/logging";

import {
  IInstanceDataOutput,
  ICommunityDataOutput,
  IMBinMagazineOutput,
  IPiefedCommunityDataOutput,
  IFediverseDataOutput,
} from "../../../types/output";


export default class OutputUtils {
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
      logging.debug("Empty Array");
      issues.push("Empty Array(s)");
    }

    // check for duplicate baseurls
    for (let i = 0; i < returnInstanceArray.length; i++) {
      const instance = returnInstanceArray[i];

      const found = returnInstanceArray.find((i) => i.baseurl === instance.baseurl);

      if (found && found !== instance) {
        logging.debug("Duplicate Instance", instance.baseurl);
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
      logging.debug("Lovecraft not on Lemmy.World");
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
        logging.debug("Percent Diff", value, previousValue, percent);
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

      // increasing amount is totally fine
      if (item.new > item.old) {
        continue;
      }

      const isValid = checkChangeIsValid(item.new, item.old);

      if (!isValid) {
        logging.debug("Percent Diff", item.type, item.new, item.old);
        issues.push("Percent Diff: " + item.type);
      }
    }

    if (issues.length > 0) {
      logging.error("Validation Issues", issues);

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