// error record for this domain is stored alongside this failure in the error db
// so we dont hit it again within 24hrs
export class CrawlError extends Error {
  constructor(message) {
    super(message);
    this.name = "CrawlError";
  }
}

// should log and not re-try worker
// for when we crawled too recently, not a lemmy instance
export class CrawlWarning extends Error {
  constructor(message) {
    super(message);
    this.name = "CrawlWarning";
  }
}
