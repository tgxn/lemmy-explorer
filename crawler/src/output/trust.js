import storage from "../storage.js";

import divinator from "divinator";

// used to calculate instance overall rating, as well as several instance and community metrics
// it is meant to take some of the trust assertion logic out of the main output script

// create a new isntance for the overall output, and call methods on it
export default class Trust {
  // init  this once per output
  constructor() {
    this.instanceList = null;
  }

  /**
    we use several methods combined to output an overall score per-instannce
    and additional scoring for community metrics.

    - total allowed/blocked federation instances. (1 point per allowed, -10 per blocked)
    - total linked federation instances. (1 point per linked)

    - does a guarantee exist on fediseer? (1 point)
    - how many endorsements does this instance have? (1 point per endorsement)
  */

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
      3.2
    );
    let response2 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      3.2
    );
    let response3 = divinator.zscore(
      this.allInstanceMetrics.userActivityScores,
      3.2
    );

    console.log("data deviation", response1);

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
