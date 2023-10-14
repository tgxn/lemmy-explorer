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
 * this library is used to calculate various metrics for an instance
 *
 * - "score" - from activityscore (federated instances vs. instancezs that defederated with)
 * - "suspicious" boolean - if the site has odd posts/user activity, and if not guarantored on fediseer
 * - "trusted" string || null - if there is a guarantor for this instance, who is it?
 * - "metrics" object - various metrics for the instance
 * - "tags" - ["cloudflare"]
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

    this.fediseerData = await storage.fediseer.getLatest();
    this.endorsements = this.getAllInstanceEndorsements();

    // parse all federated instance data
    const [linkedFederation, allowedFederation, blockedFederation] =
      this.getFederationLists(this.instanceList);

    this.linkedFederation = linkedFederation;
    this.allowedFederation = allowedFederation;
    this.blockedFederation = blockedFederation;

    // generate trust data for each instance
    await this.getInstancesWithMetrics();
  }

  getAllInstanceEndorsements() {
    const endorsements = {};
    this.fediseerData.forEach((instance) => {
      if (instance.endorsements) {
        endorsements[instance.domain] = instance.endorsements;
      }
    });
    return endorsements;
  }

  async getInstancesWithMetrics() {
    this.instancesWithMetrics = await Promise.all(
      this.instanceList.map(async (instance) => {
        const baseUrl = instance.siteData.site.actor_id.split("/")[2];

        const instanceMetrics = await this.calculateInstanceMetrics(instance);

        const instanceGuarantor = this.fediseerData.find(
          (instance) => instance.domain === baseUrl
        );

        let guarantor = null;
        if (
          instanceGuarantor !== undefined &&
          instanceGuarantor.guarantor !== null
        ) {
          console.log(
            baseUrl,
            "instanceGuarantor",
            instanceGuarantor.guarantor
          );
          guarantor = instanceGuarantor.guarantor;
        }

        return {
          // ...instance,

          baseurl: baseUrl,
          metrics: instanceMetrics,

          users: instance.nodeData.usage.users.total,
          name: instance.siteData.site.name,

          base: baseUrl, // preserved for UI

          actor_id: instance.siteData.site.actor_id,

          // reasons: susReasons,

          tags: this.getInstanceTags(instance),

          guarantor,
          endorsements: this.endorsements[baseUrl] || 0,
        };
      })
    );

    // get all metrics into one object
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

    this.deviations = await this.calcInstanceDeviation();

    // add reasons to each instance after deviations are calculated
    this.instancesWithMetrics = await Promise.all(
      this.instancesWithMetrics.map(async (instance) => {
        const susReasons = await this.instanceSusReasonList(
          instance.baseurl,
          instance.metrics
        );

        const instanceScore = this.calcInstanceScore(instance.baseurl);

        return {
          ...instance,
          score: instanceScore,
          reasons: susReasons,
        };
      })
    );
  }

  getInstanceTags(instance) {
    let tags = [];

    const baseUrl = instance.siteData.site.actor_id.split("/")[2];
    const fediseerData = this.fediseerData.find(
      (instance) => instance.domain === baseUrl
    );

    if (fediseerData && fediseerData.tags) {
      tags = fediseerData.tags.map((tag) => tag.tag);
    }

    // add cloudflare to tags too
    if (instance.headers) {
      // cloudflare
      if (instance.headers?.server?.includes("cloudflare")) {
        tags.push("cloudflare");
      }

      // cors
      if (instance.headers["access-control-allow-origin"]?.includes("*")) {
        tags.push("cors-header");
      }
    }
    return tags;
  }

  /**
   *  returns an object with various metrics for an instance
   *
   * @param {*} instance
   */
  async calculateInstanceMetrics(instance) {
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

  async instanceSusReasonList(baseUrl, metrics) {
    // const instanceBaseUrl = instance.siteData.site.actor_id.split("/")[2];

    // let metrics = await this.getMetrics(instance);

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

    // removed since it doesn't seem to be required anymore. (with new deviations checking)
    // const SUS_LEVEL_LOW = 900;
    // if (metrics.activityUserScore > SUS_LEVEL_LOW) {
    //   // console.log(this.baseUrl, "activityUserScore", metrics.activityUserScore);
    //   reasons.push(
    //     `Total Activity vs. Total Users is HIGH: ${metrics.totalActivity} / ${metrics.usersTotal} = ${metrics.activityUserScore}`
    //   );
    // }

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

    if (this.deviations[baseUrl] && this.deviations[baseUrl].length > 0) {
      reasons.push(`deviations: ${this.deviations[baseUrl].join(", ")}`);
    }

    // if they have a guarantor, they are not sus
    const instanceGuarantor = this.getInstanceGuarantor(baseUrl);

    // console.log("instanceGuarantor", instanceGuarantor);
    if (instanceGuarantor !== null) {
      if (reasons.length > 0) {
        console.log(
          `skipping sus checks for instance: ${baseUrl} with guarantor: ${instanceGuarantor} (that sould have been marked as sus otherwise!)`,
          reasons
        );
      }

      return [];
    }

    // @TODO add check for users increase % between crawls

    return reasons;
  }

  // getters for the data
  getInstanceGuarantor(baseUrl) {
    const instanceGuarantor = this.instancesWithMetrics.find(
      (instance) => instance.baseurl === baseUrl
    );

    if (instanceGuarantor?.guarantor) {
      return instanceGuarantor.guarantor;
    }

    return null;
  }

  // getMetrics(baseUrl) {
  //   const instanceGuarantor = this.instancesWithMetrics.find(
  //     (instance) => instance.baseurl === baseUrl
  //   );

  //   if (instanceGuarantor?.metrics) {
  //     return instanceGuarantor.metrics;
  //   }

  //   return null;
  // }

  getInstance(baseUrl) {
    const instanceGuarantor = this.instancesWithMetrics.find(
      (instance) => instance.baseurl === baseUrl
    );

    if (instanceGuarantor) {
      return instanceGuarantor;
    }

    return null;
  }

  /**
   * returns an array of instances that are suspicious
   *
   */
  getSusInstances() {
    const susInstances = [];

    for (const instance of this.instancesWithMetrics) {
      if (instance.reasons.length > 0) {
        susInstances.push({
          users: instance.users,
          name: instance.name,
          base: instance.baseurl,
          actor_id: instance.actor_id,
          metrics: instance.metrics,
          reasons: instance.reasons,
        });
      }
    }

    return susInstances;
  }

  getInstanceSusReasons(baseUrl) {
    const instanceGuarantor = this.instancesWithMetrics.find(
      (instance) => instance.baseurl === baseUrl
    );

    if (instanceGuarantor?.reasons) {
      return instanceGuarantor.reasons;
    }

    return [];
  }

  /**
    we use several methods combined to output an overall score per-instannce
    and additional scoring for community metrics.

    - total allowed/blocked federation instances. (1 point per allowed, -10 per blocked)
    - total linked federation instances. (1 point per linked)

    - does a guarantee exist on fediseer? (1 point)
    - how many endorsements does this instance have? (1 point per endorsement)
  */
  async calcInstanceDeviation() {
    // these returns an array of deviations for each value in the array
    let response1 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      0.75
    );
    let response2 = divinator.zscore(
      this.allInstanceMetrics.activityUserScores,
      0.75
    );
    let response3 = divinator.zscore(
      this.allInstanceMetrics.userActiveMonthScores,
      0.75
    );

    // deviations are stored as arrays of booleans (true if they are outside the allowed range)
    const deviations = {};
    for (const index in this.instancesWithMetrics) {
      const baseUrlDeviations = [];

      if (response1[index]) {
        baseUrlDeviations.push("userActivityScore");
      }
      if (response2[index]) {
        baseUrlDeviations.push("activityUserScore");
      }
      if (response3[index]) {
        baseUrlDeviations.push("userActiveMonthScore");
      }

      if (baseUrlDeviations.length > 0) {
        console.log(
          "instance deviates!!",
          this.instancesWithMetrics[index].baseurl,
          baseUrlDeviations
        );

        deviations[this.instancesWithMetrics[index].baseurl] =
          baseUrlDeviations;
      }
    }

    console.log("deviations", Object.keys(deviations).length);

    return deviations;
  }

  // run domain through this to get scores
  // this generates the "smart sort" score that is used by default
  calcInstanceScore(baseUrl) {
    let score = 0;

    const scores = {};

    // having a linked instance gives you a point for each link
    if (this.linkedFederation[baseUrl]) {
      score += this.linkedFederation[baseUrl] / 2;
      scores.linked = this.linkedFederation[baseUrl] / 2;
    }

    // having endorsements will boost you in the search results
    if (this.endorsements[baseUrl]) {
      score += this.endorsements[baseUrl] * 4;
      scores.endorsements = this.endorsements[baseUrl] * 4;
    }

    // each allowed instance gives you points
    if (this.allowedFederation[baseUrl]) {
      score += this.allowedFederation[baseUrl] * 3;
      scores.allowed = this.allowedFederation[baseUrl] * 3;
    }

    // each blocked instance takes away points
    if (this.blockedFederation[baseUrl]) {
      score -= this.blockedFederation[baseUrl] * 10;
      scores.blocked = "-" + this.blockedFederation[baseUrl] * 10;
    }

    if (scores.endorsements) {
      console.log(baseUrl, scores);
    }

    return score;
  }

  async calcCommunityScore(baseUrl, community) {
    const instanceMetrics = this.instancesWithMetrics.find(
      (instance) => instance.baseurl === baseUrl
    );

    // multiply score based subscribers
    const score = instanceMetrics.score * community.counts.subscribers;

    return score;
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
