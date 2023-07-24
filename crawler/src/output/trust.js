import storage from "../storage.js";

import divinator from "divinator";

// used to calculate instance overall rating, as well as several instance and community metrics
// it is meant to take some of the trust assertion logic out of the main output script

/**
 * this class is instanciated with a insdtance data and optionally community data
 *
 * we have multiple methods to check metrics and return a suspicion level
 *
 * the initial check for total users vs. instance activity is from db0's work on the overseer
 * https://github.com/db0/lemmy-overseer/blob/main/overseer/observer.py#L56
 */

/**
 * - score - from activityscore (federated instances vs. instancezs that defederated with)
 * - "suspicious" boolean - if the site has odd posts/user activity, and if not guarantored on fediseer
 * - "trusted" string || null - if there is a guarantor for this instance, who is it?
 *
 *
 */

// create a new isntance for the overall output, and call methods on it
export default class OutputTrust {
  // init  this once per output
  constructor() {
    this.instanceList = null;
  }

  // loads the initial data into the trust library
  async setupSources(instanceList) {
    this.instanceList = instanceList;

    // parse all federated instance data
    const [linkedFederation, allowedFederation, blockedFederation] =
      this.getFederationLists(this.instanceList);

    this.linkedFederation = linkedFederation;
    this.allowedFederation = allowedFederation;
    this.blockedFederation = blockedFederation;

    // this.instanceDeviation = await this.calcInstanceDeviation();
  }

  async getMetrics(instance) {
    const baseUrl = instance.siteData.site.actor_id.split("/")[2];

    const metrics = {
      usersTotal: instance.siteData.counts.users || 1,

      usersMonth: instance.siteData.counts.users_active_month || 1,
      usersWeek: instance.siteData.counts.users_active_week || 1,

      totalActivity:
        instance.nodeData.usage.localPosts +
          instance.nodeData.usage.localComments || 1,
      localPosts: instance.nodeData.usage.localPosts || 1,
      localComments: instance.nodeData.usage.localComments || 1,
    };

    // using the history, calculate how much it increses each crawl
    // and then how many users per minute that is...
    // also calculate how much increase growth % per scan
    let instanceUserHistory = await storage.instance.getAttributeWithScores(
      baseUrl,
      "users"
    );
    // console.log("getAttributeWithScores", instanceUserHistory);
    if (instanceUserHistory.length > 0) {
      // used to track as we check the history
      let totalUserCount = 0; // used for average

      let lastRecord = instanceUserHistory[0];

      let biggestJump = 0;

      let increases = [];

      for (let i = 0; i < instanceUserHistory.length; i++) {
        const userCount = Number(instanceUserHistory[i].value);
        const timeScore = Number(instanceUserHistory[i].score);
        const userIncrease = userCount - Number(lastRecord.value); // 0 for first record
        const timeIncrease = timeScore - Number(lastRecord.score); // 0 for first record

        const percentOfTotalIncrease = userIncrease / metrics.usersTotal || 0;

        // console.log(
        //   this.baseUrl,
        //   "userCount",
        //   userCount,
        //   "timeScore",
        //   timeScore,
        //   "userIncrease",
        //   userIncrease,
        //   "timeIncrease",
        //   timeIncrease,
        //   "pctTotal",
        //   percentOfTotalIncrease
        // );

        // add for averaging
        totalUserCount = totalUserCount + userCount;

        // if this jump is bigger jump than what's stored
        if (userIncrease > biggestJump) {
          biggestJump = userIncrease;
        }

        // if this is a new entry
        // if (biggestJump !== 0) {
        increases.push({
          users: userCount,
          time: timeScore,
          userIncrease,
          timeIncrease,
          pctTotal: percentOfTotalIncrease,
        });
        // }

        lastRecord = instanceUserHistory[i];
      }

      // console.log(
      //   this.baseUrl,
      //   "totalUsers AVERAGE",
      //   totalUserCount / instanceUserHistory.length,
      //   "biggestJump",
      //   biggestJump,
      //   "increases",
      //   increases
      // );

      metrics.averageUsers = totalUserCount / instanceUserHistory.length || 1;
      metrics.biggestJump = biggestJump || 1;

      // for each output, calculate the average increase per minute
      let totalPerMinute = 0;
      let totalIncreases = 0;

      for (let i = 0; i < increases.length; i++) {
        const increateObject = increases[i];
        if (increateObject.userIncrease > 0) {
          const minutesPassed = increateObject.timeIncrease / 1000 / 60;
          const perMinute = increateObject.userIncrease / minutesPassed;

          totalPerMinute = totalPerMinute + perMinute;
          totalIncreases++;

          // console.log(
          //   this.baseUrl,
          //   increateObject.userIncrease,
          //   totalPerMinute.toFixed(2),
          //   totalIncreases.toFixed(2),
          //   minutesPassed.toFixed(2),
          //   perMinute.toFixed(2)
          // );
        }
      }

      metrics.averagePerMinute =
        Number((totalPerMinute / totalIncreases).toFixed(5)) || -1;
      // console.log(
      //   this.baseUrl,
      //   "averagePerMinute",
      //   metrics.averagePerMinute,
      //   "totalIncreases",
      //   totalIncreases
      // );
    }

    return {
      ...metrics,

      userActivityScore: metrics.usersTotal / metrics.totalActivity,
      activityUserScore: metrics.totalActivity / metrics.usersTotal,

      userActiveMonthScore: metrics.usersTotal / metrics.usersMonth,
    };
  }

  async isSuspiciousReasons(instance) {
    let metrics = await this.getMetrics(instance);

    // console.log(this.baseUrl, "metrics", metrics);

    // if less than x, skip
    if (
      metrics.usersTotal < 1000 &&
      metrics.localPosts < 1000 &&
      metrics.localComments < 1000
    ) {
      return [];
    }

    // no data is sus
    if (!metrics.usersTotal) {
      return ["no data in usersTotal"];
      // reasons.push("no data in usersTotal");
    }

    const reasons = [];

    // checks for total users vs. posts+comments
    // const postActivityFail = this.isPostActivityLow();

    const SUS_LEVEL = 20;
    if (metrics.userActivityScore > SUS_LEVEL) {
      reasons.push(
        `Total Users vs. Total Activity is LOW: ${metrics.usersTotal} / ${metrics.totalActivity} = ${metrics.userActivityScore}`
      );
    }

    const SUS_LEVEL_LOW = 900;
    if (metrics.activityUserScore > SUS_LEVEL_LOW) {
      // console.log(this.baseUrl, "activityUserScore", metrics.activityUserScore);
      reasons.push(
        `Total Activity vs. Total Users is HIGH: ${metrics.totalActivity} / ${metrics.usersTotal} = ${metrics.activityUserScore}`
      );
    }

    // checks for total users vs. active users metric
    // const userAtivityFail = this.isUserActivityLow();
    const susMaxPercent = 500;
    if (metrics.userActiveMonthScore > susMaxPercent) {
      reasons.push(
        `MAU Count is LOW: ${metrics.usersTotal} / ${metrics.usersMonth} = ${metrics.userActiveMonthScore}`
      );
    }

    // disabled as it also picks up big instances that dont have lots of scan data
    // const biggestJumpMax = 1000;
    // if (metrics.biggestJump > biggestJumpMax) {
    //   reasons.push(`biggest jump is too big: ${metrics.biggestJump}`);
    // }

    if (metrics.averagePerMinute > 9.5) {
      // console.log(this.baseUrl, "averagePerMinute", metrics.averagePerMinute);
      reasons.push(`averagePerMinute is too high: ${metrics.averagePerMinute}`);
    }

    // @TODO add check for users increase % between crawls

    return reasons;
  }

  // reports true/false
  async isSuspicious(instance) {
    const susFail = await this.isSuspiciousReasons(instance);
    if (susFail.length > 0) {
      return true;
    }

    return false;
  }

  /**
    we use several methods combined to output an overall score per-instannce
    and additional scoring for community metrics.

    - total allowed/blocked federation instances. (1 point per allowed, -10 per blocked)
    - total linked federation instances. (1 point per linked)

    - does a guarantee exist on fediseer? (1 point)
    - how many endorsements does this instance have? (1 point per endorsement)
  */

  async setAllInstancesWithMetrics(storeData) {
    this.instancesWithMetrics = storeData;

    this.allInstanceMetrics = {
      userActivityScores: this.instancesWithMetrics.map(
        (instance) => instance.metrics.userActivityScore
      ),
      activityUserScores: this.instancesWithMetrics.map(
        (instance) => instance.metrics.activityUserScore
      ),
      userActiveMonthScores: this.instancesWithMetrics.map(
        (instance) => instance.metrics.userActiveMonthScore
      ),
    };
  }

  async calcInstanceDeviation() {
    let response1 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      3.1
    );
    let response2 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      3.1
    );
    let response3 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      3.1
    );

    // console.log("data deviation", response1);

    for (const index in this.instancesWithMetrics) {
      if (response1[index]) {
        console.log(
          "userActivityScore deviation",
          this.instancesWithMetrics[index].metrics.userActivityScore,
          this.instancesWithMetrics[index].url,
          response1[index]
        );
      }
      if (response2[index]) {
        console.log(
          "activityUserScore deviation",
          this.instancesWithMetrics[index].metrics.userActivityScore,
          this.instancesWithMetrics[index].url,
          response2[index]
        );
      }
      if (response3[index]) {
        console.log(
          "userActiveMonthScore deviation",
          this.instancesWithMetrics[index].metrics.userActivityScore,
          this.instancesWithMetrics[index].url,
          response3[index]
        );
      }
    }
  }

  // run domain through this to get scores
  async scoreInstance(baseUrl) {
    let score = 0;
    // having a linked instance gives you a point for each link
    if (this.linkedFederation[baseUrl]) {
      score += this.linkedFederation[baseUrl];
    }

    // each allowed instance gives you points
    if (this.allowedFederation[baseUrl]) {
      score += this.allowedFederation[baseUrl] * 2;
    }

    // each blocked instance takes away points
    if (this.blockedFederation[baseUrl]) {
      score -= this.blockedFederation[baseUrl] * 10;
    }

    return score;
  }

  async scoreCommunity(baseUrl, community) {
    let score = await this.scoreInstance(baseUrl);

    // multiply score based subscribers
    score = score * community.counts.subscribers;

    return score;

    // return {
    //   score: score,
    // }
  }

  // given an array, get a d-duped list of all the baseurls, returns three arrays with counts for each
  getFederationLists(instances) {
    // count instances by list
    let linkedFederation = {};
    let allowedFederation = {};
    let blockedFederation = {};

    function dedupAddItem(list, baseUrl) {
      // only add strings
      if (typeof baseUrl !== "string") {
        return;
      }

      if (!list[baseUrl]) {
        list[baseUrl] = 1;
      } else {
        list[baseUrl]++;
      }
    }

    // start crawler jobs for all of the instances this one is federated with
    instances.forEach((instance) => {
      if (!instance.siteData?.federated) {
        // logging.debug("no federated data", instance.siteData.site.actor_id);
        return;
      }

      const { linked, allowed, blocked } = instance.siteData.federated;

      // logging.silly(
      //   `federated instances: ${instance.siteData.site.actor_id}`,
      //   instance.siteData.federated.linked.length
      // );

      if (linked.length > 0) {
        for (const baseUrl of linked) {
          dedupAddItem(linkedFederation, baseUrl);
        }
      }
      if (allowed && allowed.length > 0) {
        for (const baseUrl of allowed) {
          dedupAddItem(allowedFederation, baseUrl);
        }
      }
      if (blocked && blocked.length > 0) {
        for (const baseUrl of blocked) {
          dedupAddItem(blockedFederation, baseUrl);
        }
      }
    });

    // logging.info(
    //   `Federation Linked: ${Object.keys(linkedFederation).length} Allowed: ${
    //     Object.keys(allowedFederation).length
    //   } Blocked: ${Object.keys(blockedFederation).length}`
    // );

    console.log("Global Federation Counts (counts of urls in merged lists)");
    console.table({
      linked: Object.keys(linkedFederation).length,
      allowed: Object.keys(allowedFederation).length,
      blocked: Object.keys(blockedFederation).length,
    });

    return [linkedFederation, allowedFederation, blockedFederation];
  }
}
