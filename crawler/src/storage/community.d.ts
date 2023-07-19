import RedisStorage from "../storage";

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

declare class Community {
  constructor(storage: any);
}

export default Community;
