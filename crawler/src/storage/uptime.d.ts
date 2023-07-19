export default class Uptime {
    constructor(storage: any);
    storage: any;
    getLatest(): Promise<any>;
    addNew(data: any): Promise<any>;
}
