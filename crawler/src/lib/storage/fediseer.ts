import { CrawlStorage } from "../crawlStorage";

export type IFediseerInstanceFlags = {
  flag: "RESTRICTED" | "MUTED";
  comment: string;
};

export type IFediseerTag = {
  tag: string;
  count?: number;
  rank?: number;
};

export type IFediseerInstanceData = {
  id: number;
  domain: string;
  software: string;
  version: string;
  claimed: number;
  open_registrations: boolean;
  email_verify: boolean;
  approval_required: boolean;
  has_captcha: boolean;
  approvals: number;
  endorsements: number;
  guarantor: string;
  censure_reasons: string[] | null;
  sysadmins: number;
  moderators: number;

  state: "UP" | "UNREACHABLE" | "OFFLINE" | "DECOMMISSIONED";

  tags: IFediseerTag[] | string[];

  visibility_endorsements: "OPEN" | "ENDORSED" | "PRIVATE";
  visibility_censures: "OPEN" | "ENDORSED" | "PRIVATE";
  visibility_hesitations: "OPEN" | "ENDORSED" | "PRIVATE";

  flags: IFediseerInstanceFlags[];
};

export default class Fediseer {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFediseerInstanceData[]> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFediseerInstanceData[]) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
