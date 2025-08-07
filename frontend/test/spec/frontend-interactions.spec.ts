import { test, expect } from "@playwright/test";
import { setupGlobalHooks } from "../config/test.utils";
setupGlobalHooks();

const instancesData = [
  {
    name: "Example",
    title: "Example",
    baseurl: "example.com",
    tags: ["tag1"],
    url: "https://example.com",
    open: true,
    isSuspicious: false,
    score: 10,
    usage: { users: { total: 100 }, localPosts: 5, localComments: 1 },
    counts: { users_active_day: 1, users_active_week: 1, users_active_month: 1 },
    version: "0.18.0",
    published: 0,
  },
];

const tagsMeta = [{ tag: "tag1", count: 1 }];

const metricsData = {
  instance: {
    name: "Example",
    baseurl: "example.com",
    url: "https://example.com",
    icon: "",
    desc: "Example instance",
  },
  communityCount: 0,
  versions: [],
};

test.describe("instances interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/data/instances.min.json", (route) => route.fulfill({ json: instancesData }));
    await page.route("**/data/tags.meta.json", (route) => route.fulfill({ json: tagsMeta }));
  });

  test("adjust filter tags", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Tags/i }).click();
    await page.getByRole("button", { name: /Hide All/i }).click();
    await page.waitForTimeout(300);
    const storage = await page.evaluate(() => JSON.parse(localStorage.getItem("explorer_storage") || "{}"));
    expect(storage.filteredTags?.length).toBeGreaterThan(0);
  });

  test("enter search terms", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.fill('input[placeholder="Filter Instances"]', "example");
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/query=example/);
  });
});

test.describe("mbin interactions", () => {
  const magazinesMeta = { count: 1 };
  const magazinesChunk = [
    {
      name: "mag",
      title: "Test Mag",
      baseurl: "mag.example",
      description: "desc",
      isAdult: false,
      subscriptions: 1,
      posts: 0,
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/data/magazines.json", (route) => route.fulfill({ json: magazinesMeta }));
    await page.route("**/data/magazines/0.json", (route) => route.fulfill({ json: magazinesChunk }));
  });

  test("search and order in mbin magazines", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: /Lemmy Explorer/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /MBin Explorer/i }).click();
    await expect(page).toHaveURL(/\/mbin\/magazines/);
    await page.fill('input[placeholder="Filter Magazines"]', "test");
    await expect(page).toHaveURL(/query=test/);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Posts/i }).click();
    await expect(page).toHaveURL(/order=posts/);
  });
});

test.describe("piefed interactions", () => {
  const piefedMeta = { count: 1 };
  const piefedChunk = [
    {
      name: "pf",
      title: "PF Community",
      baseurl: "pf.example",
      description: "desc",
      isAdult: false,
      subscribers: 1,
      posts: 0,
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/data/piefed_communities.json", (route) => route.fulfill({ json: piefedMeta }));
    await page.route("**/data/piefed_communities/0.json", (route) => route.fulfill({ json: piefedChunk }));
  });

  test("search and order in piefed communities", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: /Lemmy Explorer/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /Piefed Explorer/i }).click();
    await expect(page).toHaveURL(/\/piefed\/communities/);
    await page.fill('input[placeholder="Filter Communities"]', "pf");
    await expect(page).toHaveURL(/query=pf/);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Posts/i }).click();
    await expect(page).toHaveURL(/order=posts/);
  });
});
