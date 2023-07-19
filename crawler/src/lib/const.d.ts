export const REDIS_URL: string;
export const LOG_LEVEL: string;
export const AUTO_UPLOAD_S3: string | false;
export const REDIS_DUMP_FILE: string;
export const CHECKPOINT_DIR: string;
export const AWS_REGION: string;
export const PUBLISH_S3_BUCKET: string;
export namespace CRAWL_TIMEOUT {
    let INSTANCE: number;
    let COMMUNITY: number;
    let KBIN: number;
}
export namespace OUTPUT_MAX_AGE {
    let INSTANCE_1: number;
    export { INSTANCE_1 as INSTANCE };
    let COMMUNITY_1: number;
    export { COMMUNITY_1 as COMMUNITY };
    export let MAGAZINE: number;
}
export namespace CRAWL_AGED_TIME {
    let INSTANCE_2: number;
    export { INSTANCE_2 as INSTANCE };
    let COMMUNITY_2: number;
    export { COMMUNITY_2 as COMMUNITY };
    export let FEDIVERSE: number;
}
export namespace CRAWL_DELETE_TIME {
    let COMMUNITY_3: number;
    export { COMMUNITY_3 as COMMUNITY };
}
export namespace RECORD_TTL_TIMES_SECONDS {
    let LAST_CRAWL: number;
    let ERROR: number;
}
export namespace CRON_SCHEDULES {
    export let PUBLISH_S3: string;
    export let AGED: string;
    export let UPTIME: string;
    let KBIN_1: string;
    export { KBIN_1 as KBIN };
}
export const AXIOS_REQUEST_TIMEOUT: number;
export const FEDDIT_URLS: string[];
export const START_URLS: string[];
export const CRAWLER_USER_AGENT: "lemmy-explorer-crawler/1.0.0";
export const CRAWLER_ATTRIB_URL: "https://lemmyverse.net";
