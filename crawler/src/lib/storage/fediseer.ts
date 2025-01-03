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

export type IFediseerTagData = {
  tag: string;
  rank: number;
};

export type IFediseerData = {
  id: number;
  domain: string;
  software: string;
  claimed: number;
  open_registrations: boolean;
  email_verify: boolean;
  approvals: number;
  endorsements: number;
  guarantor: string;
  tags?: IFediseerTagData[];
};

export default class Fediseer {
  private storage: CrawlStorage;

  constructor(storage: CrawlStorage) {
    this.storage = storage;
  }

  async getLatest(): Promise<IFediseerData[]> {
    // records have uptime:timestamp key, extract the latest one
    const keys = await this.storage.client.keys(`fediseer:*`);
    const latestKey = keys.reduce((a, b) => (a > b ? a : b));
    return this.storage.getRedis(latestKey);
  }

  async addNew(data: IFediseerData[]) {
    return this.storage.putRedis(`fediseer:${Date.now()}`, data);
  }
}
