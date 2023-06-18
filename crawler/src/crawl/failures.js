/**
 * should recrawl failed jobs and decide what to do with them
 *
 * instances
 *  - if the instance is down, we should remove it from the db
 *  - if the instance is up, we should recrawl it
 *
 * communities
 *  check when instance was last crawled
 *   if it was crawled recently, we should recrawl it
 *
 *
 *
 */

class FailureCrawl {}
