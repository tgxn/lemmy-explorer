import logging from "./logging";

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

export function getActorBaseUrl(actorId) {
  const actorBaseUrl = actorId.split("/")[2];

  if (isValidLemmyDomain(actorBaseUrl)) {
    return actorBaseUrl;
  }

  return false;
}

export function getActorCommunity(actorId) {
  const actorCommunity = actorId.split("/")[4];

  return actorCommunity;
}
