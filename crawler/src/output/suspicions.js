/**
 * this class is instanciated with a insdtance data and optionally community data
 *
 * we have multiple methods to check metrics and return a suspicion level
 *
 * the initial check for total users vs. instance activity is from db0's work on the overseer
 * https://github.com/db0/lemmy-overseer/blob/main/overseer/observer.py#L56
 */

import storage from "../storage.js";

export class Suspicions {
  // instance is from redis
  constructor(instance, log = false) {
    this.baseUrl = instance.siteData.site.actor_id.split("/")[2];
    this.instance = instance;

    this.log = log;
  }

  async getMetrics() {
    const metrics = {
      usersTotal: this.instance.siteData.counts.users || 1,

      usersMonth: this.instance.siteData.counts.users_active_month || 1,
      usersWeek: this.instance.siteData.counts.users_active_week || 1,

      totalActivity:
        this.instance.nodeData.usage.localPosts +
          this.instance.nodeData.usage.localComments || 1,
      localPosts: this.instance.nodeData.usage.localPosts || 1,
      localComments: this.instance.nodeData.usage.localComments || 1,
    };

    // using the history, calculate how much it increses each crawl
    // and then how many users per minute that is...
    // also calculate how much increase growth % per scan
    let instanceUserHistory = await storage.instance.getAttributeWithScores(
      this.baseUrl,
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

      userActiveMonthScore: metrics.usersTotal / metrics.usersMonth,
    };
  }

  async isSuspiciousReasons() {
    this.metrics = await this.getMetrics();
    let metrics = this.metrics;

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
        `user activity is low: ${metrics.usersTotal} / ${metrics.totalActivity} = ${metrics.userActivityScore}`
      );
    }

    const SUS_LEVEL_LOW = 0.001;
    if (metrics.userActivityScore < SUS_LEVEL_LOW) {
      // console.log(this.baseUrl, "userActivityScore", metrics.userActivityScore);
      reasons.push(
        `user activity is HIGH: ${metrics.usersTotal} / ${metrics.totalActivity} = ${metrics.userActivityScore}`
      );
    }

    // checks for total users vs. active users metric
    // const userAtivityFail = this.isUserActivityLow();
    const susMaxPercent = 500;
    if (metrics.userActiveMonthScore > susMaxPercent) {
      reasons.push(
        `monthly active user count is low: ${metrics.usersTotal} / ${metrics.usersMonth} = ${metrics.userActiveMonthScore}`
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
  async isSuspicious() {
    const susFail = await this.isSuspiciousReasons();
    if (susFail.length > 0) {
      return true;
    }

    return false;
  }
}
