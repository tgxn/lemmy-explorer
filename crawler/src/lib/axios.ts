import logging from "./logging";
import axios from "axios";

import { CrawlError } from "./error";

import {
  AXIOS_REQUEST_TIMEOUT,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
} from "./const";

// backoff after failed request
const RETRY_BACKOFF_SECONDS = 2;

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

  async getUrl(url, options = {}) {
    try {
      return await this.axios.get(url, options);

      // if (response.status !== 200) {
    } catch (e) {
      throw e;
      // if (e.response && e.response.data) {
      //   // throw new CrawlError(
      //   //   `Failed to get url ${url}: ${e.message}`,
      //   //   e.response.data
      //   // );

      //   throw new CrawlError(`${e.message} (attempts: ${maxRetries})`, {
      //     isAxiosError: true,
      //     code: e.code,
      //     url: e.config.url,
      //     request: e.request | null,
      //     response: e.response,
      //   });
      // }
    }
  }

  async getUrlWithRetry(url, options = {}, maxRetries = 4, current = 0) {
    try {
      return await this.axios.get(url, options);
    } catch (e) {
      if (current < maxRetries) {
        // logging.error("error in get", e);

        const delaySeconds = (current + 1) * RETRY_BACKOFF_SECONDS;

        logging.debug(
          `retrying url ${url} attempt ${
            current + 1
          }, waiting ${delaySeconds} seconds`
        );

        await new Promise((resolve) => setTimeout(resolve, delaySeconds));

        return await this.getUrlWithRetry(
          url,
          options,
          maxRetries,
          current + 1
        );
      }

      // if (e.response && e.response.data) {
      //   throw new CrawlError(`${e.message} (attempts: ${maxRetries})`, {
      //     isAxiosError: true,
      //     request: e.request | null,
      //     response: e.response.data,
      //   });
      // }

      throw new CrawlError(`${e.message} (attempts: ${maxRetries})`, {
        isAxiosError: true,
        code: e.code,
        url: e.config.url,
        request: e.request | null,
        response: e.response,
      });
    }
  }
}
