import validator from "validator";

import logging from "./logging";

export function isValidLemmyDomain(domain: string): boolean {
  // if it's not a string
  if (typeof domain !== "string") {
    logging.error("domain is not a string", domain);
    throw new Error("domain is not a string");
  }

  return validator.isFQDN(domain, { allow_numeric_tld: true });
}

export function getActorBaseUrl(actorId: string): string | false {
  const actorBaseUrl = actorId.split("/")[2];

  if (isValidLemmyDomain(actorBaseUrl)) {
    return actorBaseUrl;
  }

  return false;
}

export function getActorCommunity(actorId: string): string {
  const actorCommunity = actorId.split("/")[4];

  return actorCommunity;
}
