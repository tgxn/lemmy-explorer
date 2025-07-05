import { IUptimeNodeData } from "./storage";

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

export type IInstanceDataOutput = {
  baseurl: string;
  url: string;
  name: string;
  desc: string;
  downvotes: boolean;
  nsfw: boolean;
  create_admin: boolean;
  private: boolean;
  fed: boolean;
  version: string;
  open: boolean;
  usage: number;
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
  trust: [];
  blocks: {
    incoming: number;
    outgoing: number;
  };
  blocked: string[];
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
  // banner: string | null;
  nsfw: boolean;
  counts: Object;
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
