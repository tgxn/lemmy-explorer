export class CrawlError extends Error {
    constructor(message: any, data?: boolean);
    data: boolean;
}
export class CrawlWarning extends Error {
    constructor(message: any);
}
export class CrawlTooRecentError extends Error {
    constructor(message: any);
}
