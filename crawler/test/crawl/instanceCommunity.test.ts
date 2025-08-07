import { jest } from "@jest/globals";

// in-memory storage mock
const instanceStore: Record<string, any> = {};
const communityStore: Record<string, any> = {};

const storageMock = {
  connect: jest.fn(),
  close: jest.fn(),
  instance: {
    upsert: jest.fn((key: string, value: any) => {
      instanceStore[key] = value;
    }),
    getOne: jest.fn((key: string) => instanceStore[key] || null),
    setTrackedAttribute: jest.fn(),
  },
  community: {
    upsert: jest.fn((baseUrl: string, community: any) => {
      communityStore[`${baseUrl}:${community.community.name}`] = community;
    }),
    delete: jest.fn(),
    setTrackedAttribute: jest.fn(),
  },
  tracking: {
    getLastCrawl: jest.fn<() => Promise<any>>().mockResolvedValue(null),
    getOneError: jest.fn<() => Promise<any>>().mockResolvedValue(null),
    setLastCrawl: jest.fn(),
    upsertError: jest.fn(),
  },
  fediverse: { upsert: jest.fn(), getOne: jest.fn<() => Promise<any>>().mockResolvedValue(null) },
  mbin: { upsert: jest.fn(), setTrackedAttribute: jest.fn() },
  piefed: { upsert: jest.fn(), setTrackedAttribute: jest.fn() },
};

jest.mock("../../src/lib/crawlStorage", () => ({
  __esModule: true,
  default: storageMock,
}));

jest.mock("../../src/queue/community_list", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));
jest.mock("../../src/queue/instance", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));
jest.mock("../../src/queue/mbin", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));
jest.mock("../../src/queue/piefed", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));

import { instanceProcessor } from "../../src/crawl/instance";
import { communityListProcessor, singleCommunityProcessor } from "../../src/crawl/community";

describe("crawl jobs live", () => {
  jest.setTimeout(30000);

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(instanceStore).forEach((k) => delete instanceStore[k]);
    Object.keys(communityStore).forEach((k) => delete communityStore[k]);
  });

  const instanceBaseUrl = "lemmy.tgxn.net";
  const testCommunity = "lemmyverse";

  test("instanceProcessor stores instance data", async () => {
    const result = await instanceProcessor({ baseUrl: instanceBaseUrl });

    expect(result).toBeTruthy();
    expect(result).toHaveProperty("nodeData");
    expect(result).toHaveProperty("siteData");

    expect(storageMock.instance.upsert).toHaveBeenCalledWith(
      instanceBaseUrl,
      expect.objectContaining({ nodeData: expect.any(Object) }),
    );
  });

  test("communityListProcessor stores communities", async () => {
    await instanceProcessor({ baseUrl: instanceBaseUrl });

    const result = await communityListProcessor({ baseUrl: instanceBaseUrl });

    expect(Array.isArray(result)).toBe(true);
    expect((result as any[]).length).toBeGreaterThan(0);

    expect(storageMock.community.upsert).toHaveBeenCalled();
  });

  test("singleCommunityProcessor stores one community", async () => {
    await instanceProcessor({ baseUrl: instanceBaseUrl });

    const result = await singleCommunityProcessor({
      baseUrl: instanceBaseUrl,
      community: testCommunity,
    });

    expect(result).toBeTruthy();
    expect((result as any).community.name).toBe(testCommunity);

    expect(storageMock.community.upsert).toHaveBeenCalledWith(
      instanceBaseUrl,
      expect.objectContaining({ community: expect.objectContaining({ name: "lemmyverse" }) }),
    );
  });
});
