export default class BaseQueue {
  constructor(isWorker: any, queueName: any, jobProcessor: any);
  queueName: any;
  jobProcessor: any;
  logPrefix: string;
  queue: Queue<any>;
  createJob(jobId: any, jobData: any, onSuccess?: any): Promise<void>;
  process(): void;
}

import Queue from "bee-queue";
