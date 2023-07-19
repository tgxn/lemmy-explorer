export default class TrackingStore {
    constructor(storage: any);
    storage: any;
    failureKey: string;
    historyKey: string;
    getAllErrors(type: any): Promise<any>;
    getOneError(type: any, key: any): Promise<any>;
    upsertError(type: any, baseUrl: any, errorDetail: any): Promise<any>;
    getLastCrawl(type: any, baseUrl: any): Promise<any>;
    listAllLastCrawl(): Promise<any>;
    setLastCrawl(type: any, baseUrl: any): Promise<any>;
}
