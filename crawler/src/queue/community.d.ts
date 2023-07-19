export default class CommunityQueue extends BaseQueue {
    constructor(isWorker?: boolean, queueName?: string);
    createJob(instanceBaseUrl: any, onSuccess?: any): Promise<void>;
}
import BaseQueue from "./queue.js";
