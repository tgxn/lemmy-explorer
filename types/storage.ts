import type { BaseURL, ActorID } from "./basic";

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
    actor_id: ActorID;
    local: boolean;
    icon: string | null;
    banner: string | null;
    hidden: boolean;
    posting_restricted_to_mods: boolean;
    instance_id: number;
  };

  subscribed: string;
  blocked: boolean;

  counts: {
    community_id: number;
    subscribers: number;
    posts: number;
    comments: number;
    published: string;
    users_active_day: number;
    users_active_week: number;
    users_active_month: number;
    users_active_half_year: number;
    subscribers_local: number;
  };

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
  baseurl?: BaseURL;
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
  nodeData: {
    software: {
      name: string;
      version: string;
    };
    usage: {
      users: {
        total: number;
        activeHalfyear: number;
        activeMonth: number;
      };
      localPosts: number;
      localComments: number;
    };
    openRegistrations: boolean;
  };

  siteData: {
    site: {
      id: number;
      name: string;
      sidebar: any;
      published: string;
      updated: string;
      icon: any;
      banner: any;
      description: any;
      actor_id: ActorID;
      last_refreshed_at: string;
      inbox_url: string;
      private_key: any;
      public_key: string;
      instance_id: number;
    };

    config: {
      id: number;
      site_id: number;
      site_setup: boolean;
      enable_downvotes: boolean;
      enable_nsfw: boolean;
      community_creation_admin_only: boolean;
      require_email_verification: boolean;
      application_question?: string;
      private_instance: boolean;
      default_theme: string;
      default_post_listing_type: string;
      legal_information?: string;
      hide_modlog_mod_names: boolean;
      application_email_admins: boolean;
      slur_filter_regex?: string | null;
      actor_name_max_length: number;
      federation_enabled: boolean;
      federation_debug: boolean;
      federation_worker_count: number;
      captcha_enabled: boolean;
      captcha_difficulty: string;
      registration_mode: string;
      reports_email_admins: boolean;
      published: string;
      updated: string;
    };

    counts: {
      id: number;
      site_id: number;
      users: number;
      posts: number;
      comments: number;
      communities: number;
      users_active_day: number;
      users_active_week: number;
      users_active_month: number;
      users_active_half_year: number;
    };

    admins: {
      person: {
        id: number;
        name: string;
        display_name: string | null;
        avatar: any;
        banned: boolean;
        published: string;
        updated: string | null;
        actor_id: ActorID;
        bio: string | null;
        local: boolean;
        banner: any;
        deleted: boolean;
        inbox_url: string;
        shared_inbox_url: string;
        matrix_user_id: any;
        admin: boolean;
        bot_account: boolean;
        ban_expires: any;
        instance_id: number;
      };

      counts: {
        id: number;
        person_id: number;
        post_count: number;
        post_score: number;
        comment_count: number;
        comment_score: number;
      };
    }[];

    version: string;
    taglines: string[] | null;
    federated: {
      linked?: BaseURL[];
      allowed?: BaseURL[] | null;
      blocked?: BaseURL[];
    };
  };

  headers?: any;
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
    description: string | null;
  };
  counts: {
    id: number;
    post_count: number;
    post_reply_count: number;
    subscriptions_count: number;
    total_subscriptions_count: number;
    active_daily: number;
    active_weekly: number;
    active_monthly: number;
    active_6monthly: number;
    published: string;
  };
  subscribed: string;
  lastCrawled: number;
  baseurl: string;
};

export type IPiefedCommunityDataKeyValue = {
  [key: string]: IPiefedCommunityData;
};
