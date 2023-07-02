// error record for this domain is stored alongside this failure in the error db
// so we dont hit it again within 24hrs
export class CrawlError extends Error {
  constructor(message, data = false) {
    super(message);
    this.name = "CrawlError";
    this.data = data;
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

export class CrawlTooRecentError extends Error {
  constructor(message) {
    super(message);
    this.name = "CrawlTooRecentError";
  }
}
