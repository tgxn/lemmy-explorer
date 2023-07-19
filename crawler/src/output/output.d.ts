/**
 * this generates the .json files for the frontend /public folder
 * it conencts to redis and pulls lists of all the data we have stored
 */
export default class CrawlOutput {
    uptimeData: any;
    instanceErrors: any;
    communityErrors: any;
    instanceList: any;
    communityList: any;
    splitter: Splitter;
    loadAllData(): Promise<void>;
    fediverseData: any;
    kbinData: any;
    linkedFederation: {};
    allowedFederation: {};
    blockedFederation: {};
    isInstanceSus(instance: any, log?: boolean): Promise<boolean>;
    /**
     * Main Output Generation Script
     */
    start(): Promise<boolean>;
    validateOutput(previousRun: any, returnInstanceArray: any, returnCommunityArray: any, kbinInstanceArray: any, kbinMagazineArray: any, returnStats: any): Promise<boolean>;
    getBaseUrlUptime(baseUrl: any): any;
    findFail(baseUrl: any): any;
    stripMarkdown(text: any): any;
    getFederationLists(instances: any): {}[];
    findErrorType(errorMessage: any): "timeout" | "connectException" | "sslException" | "invalidBaseUrl" | "httpException" | "notLemmy" | "invalidActorId";
    generateInstanceMetrics(instance: any, storeCommunityData: any): Promise<void>;
    getInstanceArray(): Promise<any[]>;
    getCommunityArray(returnInstanceArray: any): Promise<any[]>;
    outputFediverseData(): Promise<any[]>;
    outputKBinInstanceList(returnStats: any): Promise<any>;
    outputClassifiedErrors(): Promise<{
        baseurl: string;
        error: any;
        time: any;
    }[]>;
    outputSusList(): Promise<{
        users: any;
        name: any;
        base: any;
        actor_id: any;
        metrics: {
            userActivityScore: number;
            activityUserScore: number;
            userActiveMonthScore: number;
            usersTotal: any;
            usersMonth: any;
            usersWeek: any;
            totalActivity: any;
            localPosts: any;
            localComments: any;
        };
        reasons: string[];
    }[]>;
    outputKBinMagazineList(): Promise<any>;
}
import Splitter from "./splitter.js";
