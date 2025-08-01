import logging from "../lib/logging";
import storage from "../lib/crawlStorage";

import { IFediseerInstanceData, IFediseerTag } from "../../../types/storage";

import CrawlClient from "../lib/CrawlClient";

export default class CrawlFediseer {
  private client: CrawlClient;

  constructor() {
    this.client = new CrawlClient("https://fediseer.com/api/v1/");
  }

  async getAllPagesData(page: number = 1): Promise<IFediseerInstanceData[]> {
    let mergedInstances: IFediseerInstanceData[] = [];

    const perPage: number = 100;

    const fediseerWhitelist = await this.client.getUrl(
      `/whitelist?endorsements=0&guarantors=0&page=${page}&limit=${perPage}&software_csv=lemmy`,
    );

    mergedInstances = [...fediseerWhitelist.data.instances];

    logging.debug(`got ${fediseerWhitelist.data.instances.length} instances from page ${page}`);

    if (fediseerWhitelist.data.instances.length != perPage) {
      return mergedInstances;
    }

    // get next page
    const nextPage = page + 1;
    const moreInstances = await this.getAllPagesData(nextPage);
    mergedInstances = [...mergedInstances, ...moreInstances];

    return mergedInstances;
  }

  async crawl() {
    /**
     * - guarantee - "single instance parent" - once per domain - "not spam"
     *   one to one mapping of an instance and a parent instance that has guaranteed it is not spam
     *
     * - endorsement - instances can endorse many other instances
     *   "instance friends" - how many other friends this instance has
     *
     * - approvals
     *   how many instances this one has endorsed
     */

    const fediseerTopTagsData = await this.client.getUrl(`/tags`);
    logging.info(`fediseer top tags total: ${fediseerTopTagsData.data.length}`);

    const fediseerWhitelist = await this.getAllPagesData();

    // logging.info(
    //   `https://fediseer.com/api/v1/whitelist?endorsements=0&guarantors=1`
    // );
    logging.info(`fediseer whitelist total: ${fediseerWhitelist.length}`);

    // map "rank" into tags, based on data from fediseerTopTagsData [{ tag, count }]
    fediseerWhitelist.forEach((instance) => {
      instance.tags = instance.tags.map((tag) => {
        const fediseerTag = fediseerTopTagsData.data.find(
          (fediseerTag: IFediseerTag) => fediseerTag.tag == tag,
        );

        if (!fediseerTag) logging.warn("fediseerTag not found in top tags", tag, fediseerTag);

        return { tag: tag, rank: fediseerTag ? fediseerTag.count : 0 };
      });
    });
    // console.log("fediseerWhitelist", fediseerWhitelist);

    // const instances = [...fediseerWhitelist];

    await storage.fediseer.addNew(fediseerWhitelist);

    // let domainGuarantees = {};
    // for (var instance of instances) {
    //   // logging.info(instance);

    //   if (domainGuarantees[instance.domain] == null) {
    //     domainGuarantees[instance.domain] = [instance];
    //   } else {
    //     // logging.info("adding instance to domainGuarantees", instance);
    //     domainGuarantees[instance.domain].push(instance);
    //   }

    //   // await storage.instance.addNew({
    //   //   timestamp: Date.now(),
    //   //   instance: instance.domain,
    //   // });
    // }

    // console.log("my instance");
    // console.table(domainGuarantees["lemmy.tgxn.net"]);

    // console.log("bad instance");
    // console.table(domainGuarantees["lemmy.podycust.co.uk"]);

    // console.log("good instance");
    // console.table(domainGuarantees["lemm.ee"]);

    // // sort by claimed and log top 5
    // let sortedGuarantees = instances.sort((a, b) => b.approvals - a.approvals);

    // console.log("sorted by approvals");
    // console.table(sortedGuarantees.slice(0, 7));

    // // sort by claimed and log top 5
    // let sortedEndorsements = instances.sort(
    //   (a, b) => b.endorsements - a.endorsements
    // );

    // console.log("sorted by endorsements");
    // console.table(sortedEndorsements.slice(0, 7));
  }
}
