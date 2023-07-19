export default class Fediverse {
    constructor(storage: any);
    storage: any;
    getAll(): Promise<any>;
    getOne(baseUrl: any): Promise<any>;
    upsert(baseUrl: any, data: any): Promise<any>;
}
