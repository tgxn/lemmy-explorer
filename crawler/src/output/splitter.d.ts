export default class Splitter {
    publicDataFolder: string;
    metricsPath: string;
    communitiesPerFile: number;
    instancesPerFile: number;
    magazinesPerFile: number;
    storeInstanceData(instanceArray: any): Promise<void>;
    storeCommunityData(communityArray: any): Promise<void>;
    storeChunkedData(chunkName: any, perFile: any, communityArray: any): Promise<void>;
    storeFediverseData(data: any, softwareData: any, softwareBaseUrls: any): Promise<void>;
    storeInstanceMetricsData(instanceBaseUrl: any, data: any): Promise<void>;
    storeMetaData(data: any): Promise<void>;
    storeInstanceErrors(data: any): Promise<void>;
    storeSuspicousData(data: any): Promise<void>;
    storeKbinInstanceList(data: any): Promise<void>;
    storeKBinMagazineData(data: any): Promise<void>;
    cleanData(): Promise<void>;
    writeJsonFile(filename: any, data: any): Promise<void>;
}
