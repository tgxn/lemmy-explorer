import { jest } from "@jest/globals";

// in-memory storage mock
const mbinStore: Record<string, any> = {};

const storageMock = {
  connect: jest.fn(),
  close: jest.fn(),
  mbin: {
    upsert: jest.fn((baseUrl: string, magazine: any) => {
      mbinStore[`${baseUrl}:${magazine.name}`] = magazine;
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

const mockMagazine = {
  magazineId: 1,
  owner: {
    magazineId: 1,
    userId: 1,
    avatar: null,
    username: "owner",
    apId: null,
  },
  icon: null,
  name: "testmag",
  title: "Test Mag",
  description: "desc",
  rules: "",
  subscriptionsCount: 10,
  entryCount: 0,
  entryCommentCount: 0,
  postCount: 5,
  postCommentCount: 3,
  isAdult: false,
  isUserSubscribed: null,
  isBlockedByUser: null,
  tags: [],
  badges: [],
  moderators: [],
  apId: null,
  apProfileId: "",
  serverSoftware: null,
  serverSoftwareVersion: null,
  isPostingRestrictedToMods: false,
};

jest.mock("../../src/lib/crawlStorage", () => ({
  __esModule: true,
  default: storageMock,
}));

jest.mock("../../src/queue/mbin", () => ({
  __esModule: true,
  default: class {
    createJob = jest.fn();
  },
}));

import CrawlMBin, { mbinInstanceProcessor } from "../../src/crawl/mbin";

describe("mbinInstanceProcessor", () => {
  jest.setTimeout(30000);

  const mbinBaseUrl = "mbin.example";

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mbinStore).forEach((k) => delete mbinStore[k]);

    jest.spyOn(CrawlMBin.prototype, "crawlInstanceData").mockResolvedValue({ site: { name: "Mock MBin" } });
    jest.spyOn(CrawlMBin.prototype, "crawlFederatedInstances").mockResolvedValue(undefined);
    jest.spyOn(CrawlMBin.prototype, "crawlMagazinesData").mockImplementation(async (domain: string) => {
      await storageMock.mbin.upsert(domain, mockMagazine);
      await storageMock.mbin.setTrackedAttribute(
        domain,
        mockMagazine.name,
        "subscriptionsCount",
        mockMagazine.subscriptionsCount,
      );
      await storageMock.mbin.setTrackedAttribute(
        domain,
        mockMagazine.name,
        "postCount",
        mockMagazine.postCount,
      );
      await storageMock.mbin.setTrackedAttribute(
        domain,
        mockMagazine.name,
        "postCommentCount",
        mockMagazine.postCommentCount,
      );
      return [mockMagazine];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("stores magazine data and tracked attributes", async () => {
    const result = await mbinInstanceProcessor({ baseUrl: mbinBaseUrl });

    expect(result).not.toBeNull();
    const res = result as any[];
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].name).toBe(mockMagazine.name);

    expect(storageMock.mbin.upsert).toHaveBeenCalledWith(
      mbinBaseUrl,
      expect.objectContaining({ name: mockMagazine.name }),
    );
    expect(mbinStore[`${mbinBaseUrl}:${mockMagazine.name}`]).toHaveProperty(
      "subscriptionsCount",
      mockMagazine.subscriptionsCount,
    );
    expect(storageMock.mbin.setTrackedAttribute).toHaveBeenCalledWith(
      mbinBaseUrl,
      mockMagazine.name,
      "subscriptionsCount",
      mockMagazine.subscriptionsCount,
    );
    expect(storageMock.mbin.setTrackedAttribute).toHaveBeenCalledWith(
      mbinBaseUrl,
      mockMagazine.name,
      "postCount",
      mockMagazine.postCount,
    );
    expect(storageMock.mbin.setTrackedAttribute).toHaveBeenCalledWith(
      mbinBaseUrl,
      mockMagazine.name,
      "postCommentCount",
      mockMagazine.postCommentCount,
    );
  });
});
