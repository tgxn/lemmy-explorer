export default class KBinStore {
    constructor(storage: any);
    storage: any;
    getAll(): Promise<any>;
    getAllWithKeys(): Promise<any>;
    getOne(baseUrl: any, magazineName: any): Promise<any>;
    upsert(baseUrl: any, magazine: any): Promise<any>;
    delete(baseUrl: any, magazineName: any, reason?: string): Promise<any>;
    setTrackedAttribute(baseUrl: any, magazineName: any, attributeName: any, attributeValue: any): Promise<any>;
}
