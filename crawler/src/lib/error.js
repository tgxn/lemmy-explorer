// error record for this domain is stored alongside this failure in the error db
// so we dont hit it again within 24hrs
export class CrawlError extends Error {
  constructor(message, data = false) {
    super(message);
    this.name = "CrawlError";

    // spread data into this
    if (data) Object.assign(this, data);
  }
}

export class CrawlTooRecentError extends Error {
  constructor(message, data = false) {
    super(message);
    this.name = "CrawlTooRecentError";

    // spread data into this
    if (data) Object.assign(this, data);
  }
}
