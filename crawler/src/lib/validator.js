import logging from "../lib/logging.js";

import isValidDomain from "is-valid-domain";

export function isValidLemmyDomain(domain) {
  // if it's not a string
  if (typeof domain !== "string") {
    logging.error("domain is not a string", domain);
    throw new Error("domain is not a string");
  }

  return isValidDomain(domain, {
    subdomain: true,
    allowUnicode: true,
    topLevel: true,
  });
}
