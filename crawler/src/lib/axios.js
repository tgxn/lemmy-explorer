import logging from "./logging.js";
import axios from "axios";

import { CrawlError } from "./error.js";

import {
  AXIOS_REQUEST_TIMEOUT,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
} from "../lib/const.js";

export default class AxiosClient {
  constructor() {
    this.axios = axios.create({
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });
  }

  async getUrlWithRetry(url, options = {}, maxRetries = 4, current = 0) {
    try {
      return await this.axios.get(url, options);
    } catch (e) {
      if (current < maxRetries) {
        // logging.error("error in get", e);

        logging.debug(
          `retrying url ${url} attempt ${current + 1}, waiting ${
            current + 1
          }*2 seconds`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, (current + 1) * 2000)
        );

        return await this.getUrlWithRetry(
          url,
          options,
          maxRetries,
          current + 1
        );
      }

      if (e.response.data) {
        throw new CrawlError(
          `Failed to get url ${url} after ${maxRetries} attempts: ${e.message}`,
          e.response.data
        );
      }

      throw new CrawlError(
        `Failed to get url ${url} after ${maxRetries} attempts: ${e.message}`
      );
    }
  }
}
