export default class InstanceCrawler {
    constructor(crawlDomain: any);
    crawlDomain: any;
    logPrefix: string;
    kbinQueue: KBinQueue;
    client: AxiosClient;
    crawl(): Promise<{
        nodeData: {
            software: any;
            usage: any;
            openRegistrations: any;
        };
        siteData: {
            site: any;
            config: any;
            counts: any;
            admins: any;
            version: any;
            taglines: any;
            federated: any;
        };
        headers: any;
        langs: string[];
    }>;
    getNodeInfo(): Promise<any>;
    getSiteInfo(): Promise<any[]>;
    /**
     * Crawls Linked Lemmy Instance Stats
     *
     * Based on code from stats crawler.
     * https://github.com/LemmyNet/lemmy-stats-crawler/blob/main/src/crawl.rs
     */
    crawlInstance(): Promise<{
        nodeData: {
            software: any;
            usage: any;
            openRegistrations: any;
        };
        siteData: {
            site: any;
            config: any;
            counts: any;
            admins: any;
            version: any;
            taglines: any;
            federated: any;
        };
        headers: any;
        langs: string[];
    }>;
}
import KBinQueue from "../queue/kbin.js";
import AxiosClient from "../lib/axios.js";
