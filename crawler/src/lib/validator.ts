import isValidDomain from "is-valid-domain";

import logging from "./logging";

export function isValidLemmyDomain(domain: string) {
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

export function getActorBaseUrl(actorId: string) {
  const actorBaseUrl = actorId.split("/")[2];

  if (isValidLemmyDomain(actorBaseUrl)) {
    return actorBaseUrl;
  }

  return false;
}

export function getActorCommunity(actorId: string) {
  const actorCommunity = actorId.split("/")[4];

  return actorCommunity;
}
