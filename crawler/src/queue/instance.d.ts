export default class InstanceQueue extends BaseQueue {
    constructor(isWorker?: boolean, queueName?: string);
    createJob(instanceBaseUrl: any, onSuccess?: any): Promise<void>;
    crawlFederatedInstanceJobs(federatedData: any): Promise<any[]>;
    getLastCrawlMsAgo(instanceBaseUrl: any): Promise<number | false>;
}
import BaseQueue from "./queue.js";
