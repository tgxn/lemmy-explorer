import { CrawlStorage } from "../crawlStorage";

/**
 *  "visibility_endorsements": "OPEN",
        "visibility_censures": "OPEN",
        "visibility_hesitations": "OPEN",
        "flags": [],
        "id": 2337,
        "domain": "soc.ottr.uk",
        "software": "mastodon",
        "claimed": 1,
        "open_registrations": false,
        "email_verify": null,
        "approval_required": false,
        "has_captcha": null,
        "approvals": 8,
        "endorsements": 1,
        "guarantor": "ff.collins-corner.cc",
        "censure_reasons": null,
        "sysadmins": 1,
        "moderators": 1,
        "state": "UP",
        "tags": [
            "friends only",
            "furry",
            "nsfw allowed",
            "hosted in eu",
            "small instance"
        ]
    },
 */

// export type IFediseerTagData = {
//   tag: string;
//   rank: number;
// };

// export type IFediseerData = {
//   id: number;
//   domain: string;
//   software: string;
//   claimed: number;
//   open_registrations: boolean;
//   email_verify: boolean;
//   approvals: number;
//   endorsements: number;
//   guarantor: string;
//   tags?: IFediseerTagData[];
// };

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
