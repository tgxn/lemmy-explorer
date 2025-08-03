import logging from "./logging";
import axios, { AxiosResponse, AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import http from "node:http";
import https from "node:https";

import { HTTPError, CrawlError } from "./error";

import { AXIOS_REQUEST_TIMEOUT, CRAWLER_USER_AGENT, CRAWLER_ATTRIB_URL, sleepThreadMs } from "./const";

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
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
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
        request: e.request || undefined,
        response: e.response || undefined,
      });
    }
  }

  public async postUrl(url: string, data: any = {}, options: AxiosRequestConfig = {}) {
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
  ): Promise<AxiosResponse> {
    for (let attempts = 0; attempts < maxRetries; attempts++) {
      try {
        const axiosResponse: AxiosResponse = await this.axios.get(url, options);

        return axiosResponse;
      } catch (e) {
        if (attempts < maxRetries - 1) {
          const delaySeconds = (attempts + 1) * RETRY_BACKOFF_SECONDS;

          await sleepThreadMs(delaySeconds * 1000);
          continue;
        }

        logging.error(`getUrlWithRetry: failed to GET ${url} after ${attempts + 1}/${maxRetries} attempts`, {
          error: e,
          url,
          options,
        });

        throw new HTTPError(`${e.message} (attempts: ${attempts + 1})`, {
          isAxiosError: true,
          code: e.code,
          url: e.config.url,
          request: e.request || null,
          response: e.response || null,
        });
      }
    }

    throw new CrawlError(`getUrlWithRetry: failed to GET ${url}`, {
      url,
      options,
      maxRetries,
    });
  }
}
