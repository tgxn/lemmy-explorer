export default class CrawlAged {
    agedInstanceBaseUrls: any[];
    instanceCrawler: InstanceQueue;
    communityCrawler: CommunityQueue;
    singleCommunityCrawler: SingleCommunityQueue;
    kbinCrawler: KBinQueue;
    recordAges(): Promise<void>;
    addInstance(instanceBaseUrl: any): void;
    getAged(): Promise<void>;
    createJobs(): Promise<void>;
}
import InstanceQueue from "../queue/instance.js";
import CommunityQueue from "../queue/community.js";
import SingleCommunityQueue from "../queue/check_comm.js";
import KBinQueue from "../queue/kbin.js";
