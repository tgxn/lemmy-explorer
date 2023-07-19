/**
 * crawlList() - Crawls over `/api/v3/communities` and stores the results in redis.
 * crawlSingle(communityName) - Crawls over `/api/v3/community` with a given community name and stores the results in redis.
 * Each instance is a unique baseURL
 */
export default class CommunityCrawler {
    constructor(crawlDomain: any);
    crawlDomain: any;
    logPrefix: string;
    client: AxiosClient;
    splitCommunityActorParts(actorId: any): {
        basePart: any;
        communityPart: any;
    };
    storeCommunityData(community: any): Promise<boolean>;
    crawlSingle(communityName: any): Promise<void>;
    getSingleCommunityData(communityName: any, attempt?: number): any;
    crawlList(): Promise<void>;
    crawlCommunityPaginatedList(pageNumber?: number): any;
    getPageData(pageNumber?: number): Promise<any[]>;
}
import AxiosClient from "../lib/axios.js";
