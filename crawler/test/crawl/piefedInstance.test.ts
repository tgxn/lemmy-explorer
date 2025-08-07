import { jest } from "@jest/globals";

// in-memory storage mock
const piefedStore: Record<string, any> = {};

const storageMock = {
  connect: jest.fn(),
  close: jest.fn(),
  piefed: {
    upsert: jest.fn((baseUrl: string, community: any) => {
      piefedStore[`${baseUrl}:${community.community.name}`] = community;
    }),
    setTrackedAttribute: jest.fn(),
  },
  tracking: {
    getLastCrawl: jest.fn<() => Promise<any>>().mockResolvedValue(null),
    getOneError: jest.fn<() => Promise<any>>().mockResolvedValue(null),
    setLastCrawl: jest.fn(),
    upsertError: jest.fn(),
  },
  fediverse: { upsert: jest.fn(), getOne: jest.fn<() => Promise<any>>().mockResolvedValue(null) },
};

const mockCommunity = {
  activity_alert: false,
  blocked: false,
  community: {
    actor_id: "https://piefed.example/c/testcommunity",
    ap_domain: "piefed.example",
    banned: false,
    deleted: false,
    hidden: false,
    icon: null,
    id: 1,
    instance_id: 1,
    local: true,
    name: "testcommunity",
    nsfw: false,
    published: "2023-01-01T00:00:00Z",
    removed: false,
    restricted_to_mods: false,
    title: "Test Community",
    updated: null,
    description: "desc",
  },
  counts: {
    id: 1,
    post_count: 5,
    post_reply_count: 2,
    subscriptions_count: 10,
    total_subscriptions_count: 10,
    active_daily: 0,
    active_weekly: 0,
    active_monthly: 0,
    active_6monthly: 0,
    published: "2023-01-01T00:00:00Z",
  },
  subscribed: "NotSubscribed",
  lastCrawled: 0,
};

jest.mock("../../src/lib/crawlStorage", () => ({
  __esModule: true,
  default: storageMock,
}));

jest.mock("../../src/queue/piefed", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));

import CrawlPiefed, { piefedInstanceProcessor } from "../../src/crawl/piefed";

describe("piefedInstanceProcessor", () => {
  jest.setTimeout(30000);

  const piefedBaseUrl = "piefed.example";

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(piefedStore).forEach((k) => delete piefedStore[k]);

    jest
      .spyOn(CrawlPiefed.prototype, "crawlInstanceData")
      .mockResolvedValue({ site: { name: "Mock Piefed" } });
    jest.spyOn(CrawlPiefed.prototype, "crawlFederatedInstances").mockResolvedValue(undefined);
    jest.spyOn(CrawlPiefed.prototype, "crawlCommunitiesData").mockImplementation(async (domain: string) => {
      await storageMock.piefed.upsert(domain, mockCommunity);
      await storageMock.piefed.setTrackedAttribute(
        domain,
        mockCommunity.community.name,
        "subscriptionsCount",
        mockCommunity.counts.subscriptions_count,
      );
      await storageMock.piefed.setTrackedAttribute(
        domain,
        mockCommunity.community.name,
        "postCount",
        mockCommunity.counts.post_count,
      );
      await storageMock.piefed.setTrackedAttribute(
        domain,
        mockCommunity.community.name,
        "postCommentCount",
        mockCommunity.counts.post_reply_count,
      );
      return [mockCommunity];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("stores community data and tracked attributes", async () => {
    const result = await piefedInstanceProcessor({ baseUrl: piefedBaseUrl });

    expect(result).not.toBeNull();
    const res = result as any[];
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].community.name).toBe(mockCommunity.community.name);

    expect(storageMock.piefed.upsert).toHaveBeenCalledWith(
      piefedBaseUrl,
      expect.objectContaining({ community: expect.objectContaining({ name: mockCommunity.community.name }) }),
    );
    expect(piefedStore[`${piefedBaseUrl}:${mockCommunity.community.name}`]).toHaveProperty(
      "counts",
      expect.objectContaining({ subscriptions_count: mockCommunity.counts.subscriptions_count }),
    );
    expect(storageMock.piefed.setTrackedAttribute).toHaveBeenCalledWith(
      piefedBaseUrl,
      mockCommunity.community.name,
      "subscriptionsCount",
      mockCommunity.counts.subscriptions_count,
    );
    expect(storageMock.piefed.setTrackedAttribute).toHaveBeenCalledWith(
      piefedBaseUrl,
      mockCommunity.community.name,
      "postCount",
      mockCommunity.counts.post_count,
    );
    expect(storageMock.piefed.setTrackedAttribute).toHaveBeenCalledWith(
      piefedBaseUrl,
      mockCommunity.community.name,
      "postCommentCount",
      mockCommunity.counts.post_reply_count,
    );
  });
});
