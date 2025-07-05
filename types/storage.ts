/// COMMUNITY

export type ICommunityData = {
  community: {
    id: number;
    name: string;
    title: string;
    description: string;
    removed: boolean;
    published: string;
    updated: string | null;
    deleted: boolean;
    nsfw: boolean;
    actor_id: string;
    local: boolean;
    icon: string | null;
    banner: string | null;
    hidden: boolean;
    posting_restricted_to_mods: boolean;
    instance_id: number;
  };
  subscribed: string;
  blocked: boolean;
  counts: Object;
  banned_from_community?: boolean;
  lastCrawled: number;
};

export type ICommunityDataKeyValue = {
  [key: string]: ICommunityData;
};

// FEDISEER

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

/// FEDIVERSE

export type IFediverseData = {
  time?: number;
  baseurl?: string;
  name?: string;
  version?: string;
  repository?: string;
  homepage?: string;
};

export type IFediverseDataKeyValue = {
  [key: string]: IFediverseData;
};

/// INSTANCEC

export type IInstanceData = {
  nodeData: any;
  siteData: any;
  headers: any;
  langs: Array<string>;
  lastCrawled: number;
};

export type IInstanceDataKeyValue = {
  [key: string]: IInstanceData;
};

///// MBIN

export type IMagazineData = {
  magazineId: number;
  owner: {
    magazineId: number;
    userId: number;
    avatar: any;
    username: string;
    apId: any;
  };
  icon: {
    storageUrl: string;
    [key: string]: any;
  } | null;
  name: string;
  title: string;
  description: string;
  rules: string;
  subscriptionsCount: number;
  entryCount: number;
  entryCommentCount: number;
  postCount: number;
  postCommentCount: number;
  isAdult: boolean;
  isUserSubscribed: any;
  isBlockedByUser: any;
  tags: string[];
  badges: {
    badgeId: number;
    magazineId: number;
    name: string;
  }[];
  moderators: {
    magazineId: number;
    userId: number;
    avatar: {
      storageUrl: string;
      [key: string]: any;
    };
    username: string;
    apId: any;
  }[];
  apId: any;
  apProfileId: string;
  serverSoftware: any;
  serverSoftwareVersion: any;
  isPostingRestrictedToMods: boolean;
  lastCrawled?: number;
  baseurl: string;
};
export type IMagazineDataKeyValue = {
  [key: string]: IMagazineData;
};

//// TRACKING

export type IErrorData = {
  time: number;
  error: string;
  stack?: string;
  isAxiosError?: boolean;
  requestUrl?: string;
  code?: string;
  url?: string;
  duration?: number;
};

export type IErrorDataKeyValue = {
  [key: string]: IErrorData;
};

export type ILastCrawlData = {
  time: number;
  duration?: number;
  [key: string]: any;
};

export type ILastCrawlDataKeyValue = {
  [key: string]: ILastCrawlData;
};

//// UPTIME

export type IUptimeNodeData = {
  domain: string;
  latency: number;
  countryname: string;
  uptime_alltime: string;
  date_created: string;
  date_updated: string;
  date_laststats: string;
  score: number;
  status: number;
};

export type IFullUptimeData = {
  timestamp: number;
  nodes: IUptimeNodeData[];
};

/// PIEFED

export type IPiefedCommunityData = {
  activity_alert: boolean;
  blocked: boolean;
  community: {
    actor_id: string;
    ap_domain: string;
    banned: boolean;
    deleted: boolean;
    hidden: boolean;
    icon: string | null;
    id: number;
    instance_id: number;
    local: boolean;
    name: string;
    nsfw: boolean;
    published: string;
    removed: boolean;
    restricted_to_mods: boolean;
    title: string;
    updated: string | null;
  };
  counts: {
    id: number;
    post_count: number;
    post_reply_count: number;
    subscriptions_count: number;
    active_daily: number;
    active_weekly: number;
    active_monthly: number;
    active_6monthly: number;
  };
  subscribed: string;
  // counts: Object;
  banned_from_community?: boolean;
  lastCrawled: number;
  baseurl: string;
};

export type IPiefedCommunityDataKeyValue = {
  [key: string]: IPiefedCommunityData;
};
