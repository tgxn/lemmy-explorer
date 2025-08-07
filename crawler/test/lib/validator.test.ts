import { jest } from "@jest/globals";

import { isValidLemmyDomain, getActorBaseUrl, getActorCommunity } from "../../src/lib/validator";

describe("isValidLemmyDomain", () => {
  test("valid domain", () => {
    expect(isValidLemmyDomain("lemmy.ml")).toBe(true);
  });

  test("invalid domain", () => {
    expect(isValidLemmyDomain("not_a_domain")).toBe(false);
  });

  test("throws on non-string", () => {
    // @ts-expect-error testing runtime
    expect(() => isValidLemmyDomain(123)).toThrow();
  });
});

describe("getActorBaseUrl", () => {
  test("extracts base url", () => {
    expect(getActorBaseUrl("https://example.com/u/user")).toBe("example.com");
  });

  test("returns null for invalid domain", () => {
    expect(getActorBaseUrl("https://invalid/u/user")).toBeNull();
  });

  test("returns null for malformed actor id", () => {
    expect(getActorBaseUrl("badstring")).toBeNull();
  });
});

describe("getActorCommunity", () => {
  test("returns community name", () => {
    expect(getActorCommunity("https://example.com/c/pics")).toBe("pics");
  });

  test("returns null when missing", () => {
    expect(getActorCommunity("https://example.com/c/")).toBeNull();
  });
});
