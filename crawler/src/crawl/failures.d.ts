export default class FailureCrawl {
    clean(): Promise<void>;
    addTTLToFailures(): Promise<void>;
    addTTLToLastCrawl(): Promise<void>;
    isInstanceValid(baseUrl: any, actorId: any): boolean;
    cleanInstancesWithInvalidBaseUrl(): Promise<void>;
    isCommunityValid(keyBaseUrl: any, keyCommmunity: any, record: any): Promise<boolean>;
    cleanCommunitiesWithInvalidBaseUrl(): Promise<void>;
    cleanInvalidInstances(): Promise<void>;
}
