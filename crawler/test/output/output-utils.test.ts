import { jest } from "@jest/globals";

import { OutputUtils } from "../../src/output/output";

describe("OutputUtils.safeSplit", () => {
  test("splits without breaking words", () => {
    const result = OutputUtils.safeSplit("hello world from lemmy", 10);
    expect(result).toBe("hello");
  });
});

describe("OutputUtils.stripMarkdownSubStr", () => {
  test("strips markdown", () => {
    const result = OutputUtils.stripMarkdownSubStr("**hello** _world_!");
    expect(result).toBe("hello world!");
  });

  test("strips and truncates", () => {
    const result = OutputUtils.stripMarkdownSubStr("**hello world**", 8);
    expect(result).toBe("hello");
  });
});

describe("OutputUtils.parseLemmyTimeToUnix", () => {
  test("parses lemmy timestamp", () => {
    const ts = "2024-01-01T12:00:00.123456Z";
    const expected = new Date("2024-01-01T12:00:00Z").getTime();
    expect(OutputUtils.parseLemmyTimeToUnix(ts)).toBe(expected);
  });
});

describe("OutputUtils.findErrorType", () => {
  const cases = [
    ["ENOENT something", "connectException"],
    ["timeout of 100ms", "timeout"],
    ["self-signed certificate", "sslException"],
    ["baseUrl is not a valid domain", "invalidBaseUrl"],
    ["code 404", "httpException"],
    ["no diaspora rel in", "httpException"],
    ["not a lemmy instance", "notLemmy"],
    ["invalid actor id", "invalidActorId"],
    ["random message", "unknown"],
  ] as const;

  test.each(cases)("%s => %s", (msg, expected) => {
    expect(OutputUtils.findErrorType(msg)).toBe(expected);
  });
});

const baseInstance = { baseurl: "example.com" } as any;
const baseCommunity = {
  url: "https://lemmy.world/c/lovecraft_mythos",
} as any;
const magazine = { baseurl: "example.com", magazineId: 1 } as any;
const piefedCommunity = { baseurl: "pie.example" } as any;
const fediverse = { url: "https://fediverse" } as any;
const previousRun = {
  instances: 1,
  communities: 1,
  mbin_instances: 1,
  magazines: 1,
  piefed_instances: 1,
  piefed_communities: 1,
  fediverse: 1,
};

describe("OutputUtils.validateOutput", () => {
  test("returns true for valid data", async () => {
    await expect(
      OutputUtils.validateOutput(
        previousRun,
        [baseInstance],
        [baseCommunity],
        ["mbin"],
        [magazine],
        ["pie"],
        [piefedCommunity],
        [fediverse],
      ),
    ).resolves.toBe(true);
  });

  test("throws on empty arrays", async () => {
    await expect(OutputUtils.validateOutput(previousRun, [], [], [], [], [], [], [])).rejects.toThrow();
  });

  test("throws on duplicate instances", async () => {
    const prev = { ...previousRun, instances: 2 };
    await expect(
      OutputUtils.validateOutput(
        prev,
        [baseInstance, { baseurl: "example.com" } as any],
        [baseCommunity],
        ["mbin"],
        [magazine],
        ["pie"],
        [piefedCommunity],
        [fediverse],
      ),
    ).rejects.toThrow();
  });

  test("throws when lovecraft community missing", async () => {
    await expect(
      OutputUtils.validateOutput(
        previousRun,
        [baseInstance],
        [{ url: "https://lemmy.world/c/other" } as any],
        ["mbin"],
        [magazine],
        ["pie"],
        [piefedCommunity],
        [fediverse],
      ),
    ).rejects.toThrow();
  });

  test("returns undefined when counts increase", async () => {
    const prev = { ...previousRun };
    await expect(
      OutputUtils.validateOutput(
        prev,
        [baseInstance, { baseurl: "two.com" } as any],
        [baseCommunity],
        ["mbin", "other"],
        [magazine],
        ["pie"],
        [piefedCommunity],
        [fediverse, fediverse],
      ),
    ).resolves.toBeUndefined();
  });

  test("throws when percent diff too high", async () => {
    const prev = { ...previousRun, instances: 100 };
    await expect(
      OutputUtils.validateOutput(
        prev,
        Array(80).fill(baseInstance),
        [baseCommunity],
        ["mbin"],
        [magazine],
        ["pie"],
        [piefedCommunity],
        [fediverse],
      ),
    ).rejects.toThrow();
  });
});

describe("OutputUtils.validateVersion", () => {
  test("cleans valid version", () => {
    expect(OutputUtils.validateVersion('"0.19.3"')).toBe("0.19.3");
  });

  test("returns false for unknown", () => {
    expect(OutputUtils.validateVersion("unknown")).toBe(false);
  });

  test("returns false for malformed", () => {
    expect(OutputUtils.validateVersion("abc")).toBe(false);
  });
});
