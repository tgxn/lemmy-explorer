export default class KBinQueue extends BaseQueue {
    constructor(isWorker?: boolean, queueName?: string);
    createJob(baseUrl: any, onSuccess?: any): Promise<void>;
}
import BaseQueue from "./queue.js";
