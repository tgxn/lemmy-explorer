import { parseVersion, compareVersionStrings } from "../../src/lib/utils";

describe("parseVersion", () => {
  it("parses standard versions", () => {
    expect(parseVersion("1.2.3")).toEqual([[1, 2, 3], ""]);
  });

  it("parses versions with suffix", () => {
    expect(parseVersion("1.2.3-alpha")).toEqual([[1, 2, 3], "alpha"]);
  });

  it("parses partial versions", () => {
    expect(parseVersion("2")).toEqual([[2, 0, 0], ""]);
  });

  it("returns null for invalid versions", () => {
    expect(parseVersion("invalid")).toBeNull();
  });
});

describe("compareVersionStrings", () => {
  it("sorts versions descending", () => {
    const versions = ["1.2.0", "1.10.0", "1.3.0"];
    const sorted = versions.sort(compareVersionStrings);
    expect(sorted).toEqual(["1.10.0", "1.3.0", "1.2.0"]);
  });

  it("places release versions before pre-releases", () => {
    const versions = ["1.0.0-alpha", "1.0.0"];
    const sorted = versions.sort(compareVersionStrings);
    expect(sorted).toEqual(["1.0.0", "1.0.0-alpha"]);
  });

  it("prioritizes numeric differences over suffix", () => {
    const versions = ["1.0.1-alpha", "1.0.0"];
    const sorted = versions.sort(compareVersionStrings);
    expect(sorted).toEqual(["1.0.1-alpha", "1.0.0"]);
  });

  it("sorts prerelease identifiers alphabetically", () => {
    const versions = ["1.0.0-alpha", "1.0.0-rc", "1.0.0-beta", "1.0.0"];
    const sorted = versions.sort(compareVersionStrings);
    expect(sorted).toEqual(["1.0.0", "1.0.0-alpha", "1.0.0-beta", "1.0.0-rc"]);
  });

  it("treats invalid versions as equal", () => {
    expect(compareVersionStrings("abc", "1.0.0")).toBe(0);
  });
});
