import type { BaseURL, ActorID } from "./basic";
import type { IUptimeNodeData } from "./storage";

export type IMetaDataOutput = {
  instances: number;
  communities: number;
  mbin_instances: number; // @ NEW
  magazines: number;

  piefed_instances: number;
  piefed_communities: number;

  fediverse: number;

  time: number;
  package: string;
  version: string;

  linked?: any;
  allowed?: any;
  blocked?: any;
};

export interface IMultiPartMetadata {
  count: number;
}

export interface ITrustMetrics {
  usersTotal: number;
  usersMonth: number;
  usersWeek: number;

  totalActivity: number;
  localPosts: number;
  localComments: number;

  averageUsers?: number; // average users per scan
  biggestJump?: number; // biggest jump in users per scan
  averagePerMinute?: number; // average users per minute
  userActivityScore?: number; // total users / total activity
  activityUserScore?: number; // total activity / total users
  userActiveMonthScore?: number; // total users / active month users
}

export type IInstanceMetrics = {
  baseurl: BaseURL;
  base: BaseURL;
  actor_id: ActorID;

  metrics: ITrustMetrics;

  users: number;
  name: string;

  tags: string[];
  guarantor?: string; // if this instance is guaranteed by a fediseer instance, who is it?
  endorsements: number; // how many endorsements does this instance have?

  score?: number; // overall score for the instance, used for sorting
  reasons?: string[]; // reasons why this instance is suspicious

  lastCrawled: number;
};

// -1: Unknown, 0: Closed, 1: RequireApplication, 2: Open
export type IRegistrationMode = -1 | 0 | 1 | 2;

export type IInstanceDataOutput = {
  baseurl: string;
  url: string;
  name: string;
  desc: string;
  downvotes: boolean;
  nsfw: boolean;
  create_admin: boolean; // community creation restricted to admins
  private: boolean;
  reg_mode: IRegistrationMode;
  fed: boolean;
  version: string;
  open: boolean;
  usage: Object;
  counts: Object;
  icon: string;
  banner: string;
  langs: string[];
  date: string;
  published: number;
  time: number;
  score: number;
  uptime?: IUptimeNodeData;
  isSuspicious: boolean;
  metrics: Object | null;
  tags: string[];
  susReason: string[];
  trust: any;
  blocks: {
    incoming: number;
    outgoing: number;
  };
  blocked: string[];

  admins: string[];
};

export type ICommunityDataOutput = {
  baseurl: string;
  url: string;
  name: string;
  title: string;
  desc: string;
  icon: string | null;
  banner: string | null;
  nsfw: boolean;
  counts: Object;
  published: number;
  time: number;
  isSuspicious: boolean;
  score: number;
};

export type IMBinInstanceOutput = {
  // actor_id: string;
  // title: string;
  // name: string;
  // preferred: string;
  // baseurl: string;
  // summary: string;
  // sensitive: boolean;
  // postingRestrictedToMods: boolean;
  // icon: string;
  // published: string;
  // updated: string;
  // followers: number;
  // time: number;
};

export type IMBinMagazineOutput = {
  baseurl: string;
  magazineId: number;
  title: string;
  name: string;
  description: string;
  isAdult: boolean;
  postingRestrictedToMods: boolean;
  icon: string | null;
  subscriptions: number;
  posts: number;
  time: number;
};

export type IPiefedCommunityDataOutput = {
  baseurl: string;
  // url: string;
  name: string;
  title: string;
  // desc: string;
  icon: string | null;
  description: string | null;
  // banner: string | null;
  nsfw: boolean;
  // counts: Object;
  subscriptions_count: number;
  post_count: number;
  published: string;
  time: number;
  // isSuspicious: boolean;
  // score: number;
  restricted_to_mods: boolean;
};

export type IFediverseDataOutput = {
  url: string;
  software: string;
  version: string;
};

export type IClassifiedErrorOutput = {
  baseurl: string;
  time: number;
  error: string;
  type?: string;
};
