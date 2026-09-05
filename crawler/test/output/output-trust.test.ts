import { describe, expect, test } from "@jest/globals";

import OutputTrust from "../../src/output/trust";

describe("OutputTrust.getFederationGraph", () => {
  test("builds compact trust, defederation, and fediseer relationships", () => {
    const trust = new OutputTrust();
    (trust as any).instanceList = [
      {
        siteData: {
          site: { actor_id: "https://alpha.example" },
          federated: {
            linked: ["beta.example"],
            allowed: ["beta.example"],
            blocked: ["blocked.example"],
          },
        },
      },
    ];
    trust.fediseerData = [
      {
        domain: "alpha.example",
        guarantor: "guarantor.example",
        endorsements: 4,
      } as any,
    ];

    const graph = trust.getFederationGraph([{ baseurl: "alpha.example", score: 12, desc: "Alpha" } as any]);

    expect(graph.nodes).toEqual([
      ["alpha.example", 12, 6],
      ["beta.example", 0, 1],
      ["blocked.example", 0, 1],
      ["guarantor.example", 0, 4],
    ]);
    expect(graph.edges).toEqual([
      [0, 1, "trust", 1],
      [0, 2, "defederate", 1],
      [3, 0, "fediseer", 4],
    ]);
  });
});
