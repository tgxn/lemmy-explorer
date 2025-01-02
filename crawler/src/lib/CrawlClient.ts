import logging from "./logging";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { HTTPError } from "./error";

import {
  AXIOS_REQUEST_TIMEOUT,
  CRAWLER_USER_AGENT,
  CRAWLER_ATTRIB_URL,
} from "./const";

// backoff after failed request
const RETRY_BACKOFF_SECONDS = 2;

export default class CrawlClient {
  private axios: AxiosInstance;

  constructor(baseURL: string | undefined = undefined) {
    this.axios = axios.create({
      baseURL,
      timeout: AXIOS_REQUEST_TIMEOUT,
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
        "X-Lemmy-SiteUrl": CRAWLER_ATTRIB_URL,
      },
    });
  }

  public async getUrl(url: string, options: AxiosRequestConfig = {}) {
    try {
      return await this.axios.get(url, options);
    } catch (e) {
      throw new HTTPError(e.message, {
        isAxiosError: true,
        code: e.code,
        url: e.config.url,
        request: e.request || null,
        response: e.response || null,
      });
    }
  }

  public async postUrl(
    url: string,
    data: any = {},
    options: AxiosRequestConfig = {}
  ) {
    try {
      return await this.axios.post(url, data, options);
    } catch (e) {
      throw new HTTPError(e.message, {
        isAxiosError: true,
        code: e.code,
        url: e.config.url,
        request: e.request || null,
        response: e.response || null,
      });
    }
  }

  public async getUrlWithRetry(
    url: string,
    options: AxiosRequestConfig = {},
    maxRetries: number = 4,
    current: number = 0
  ) {
    try {
      return await this.axios.get(url, options);
    } catch (e) {
      if (current < maxRetries) {
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

      throw new HTTPError(`${e.message} (attempts: ${maxRetries})`, {
        isAxiosError: true,
        code: e.code,
        url: e.config.url,
        request: e.request || null,
        response: e.response || null,
      });
    }
  }
}
