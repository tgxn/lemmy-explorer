import { jest } from "@jest/globals";

import CrawlClient from "../../src/lib/CrawlClient";

import type { AxiosStatic, AxiosInstance } from "axios";

const mockedAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

// Mock axios module
jest.mock("axios", () => {
  const actualAxios = jest.requireActual("axios") as AxiosStatic;
  return {
    __esModule: true,
    default: {
      ...actualAxios,
      create: jest.fn(() => mockedAxiosInstance),
    },
  };
});

describe("CrawlClient.getUrlWithRetry", () => {
  jest.setTimeout(30000);

  test("retries the expected number of times", async () => {
    mockedAxiosInstance.get.mockRejectedValue({
      message: "fail",
      config: { url: "https://example.com" },
    });

    const client = new CrawlClient();

    await expect(client.getUrlWithRetry("https://example.com", {}, 2)).rejects.toThrow("fail (attempts: 2)");

    expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(2);
  });
});
