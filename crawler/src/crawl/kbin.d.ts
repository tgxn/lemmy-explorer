export default class CrawlKBin {
    fediverseData: any;
    logPrefix: string;
    instanceQueue: InstanceQueue;
    client: AxiosClient;
    createJobsAllKBin(): Promise<void>;
    processOneInstance(kbinBaseUrl: any): Promise<void>;
    getStoreMag(kbinBaseUrl: any, mag: any): Promise<void>;
    getSketch(baseUrl: any): Promise<string[]>;
    getMagazineInfo(baseUrl: any, magazineName: any): Promise<any>;
    getFollowupData(wellKnownUrl: any): Promise<any>;
    getKBin(): Promise<any[]>;
}
import InstanceQueue from "../queue/instance.js";
import AxiosClient from "../lib/axios.js";
