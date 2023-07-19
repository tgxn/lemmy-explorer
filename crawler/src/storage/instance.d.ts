/**
 * Stores each lemmy instance, keyed on baseUrl as `instance:baseUrl`.
 *
 * Each instance is stored as a JSON object with the following fields:
 */
export default class Instance {
    constructor(storage: any);
    storage: any;
    getAll(): Promise<any>;
    getAllWithKeys(): Promise<any>;
    getOne(key: any): Promise<any>;
    upsert(baseUrl: any, value: any): Promise<any>;
    delete(key: any): Promise<any>;
    setTrackedAttribute(baseUrl: any, attributeName: any, attributeValue: any): Promise<void>;
    getAttributeArray(baseUrl: any, attributeName: any): Promise<any>;
    getAttributeWithScores(baseUrl: any, attributeName: any): Promise<any>;
}
