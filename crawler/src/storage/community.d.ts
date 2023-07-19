declare type CommunityData = {
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
  lastCrawled: number;
};

export default class Community {
  constructor(storage: any);
  storage: any;
  getAll(): Promise<any>;
  getAllWithKeys(): Promise<any>;
  getOne(baseUrl: any, communityName: any): Promise<any>;
  upsert(baseUrl: any, community: any): Promise<any>;
  delete(baseUrl: any, communityName: any, reason?: string): Promise<any>;
  setTrackedAttribute(
    baseUrl: any,
    communityName: any,
    attributeName: any,
    attributeValue: any
  ): Promise<any>;
}
