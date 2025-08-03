import { jest } from "@jest/globals";

import OutputClassifier from "../../src/output/classifier";

describe("OutputClassifier.findErrorType", () => {
  const cases = [
    ["ENOENT something", "contentMissing"],
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
    expect(OutputClassifier.findErrorType(msg)).toBe(expected);
  });
});
