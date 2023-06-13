export class CrawlError extends Error {
  constructor(message) {
    super(message);
    this.name = "CrawlError";
  }
}
export class CrawlWarning extends Error {
  constructor(message) {
    super(message);
    this.name = "CrawlWarning";
  }
}
