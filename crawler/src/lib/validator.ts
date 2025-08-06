import validator from "validator";

import logging from "./logging";

import type { BaseURL, ActorID } from "../../../types/basic";

export function isValidLemmyDomain(domain: BaseURL): boolean {
  // if it's not a string
  if (typeof domain !== "string") {
    logging.error("domain is not a string", domain);
    throw new Error("domain is not a string");
  }

  return validator.isFQDN(domain, { allow_numeric_tld: true });
}

export function getActorBaseUrl(actorId: ActorID | undefined): string | null {
  if (typeof actorId !== "string") {
    logging.error("actorId is not a string", actorId);
    return null;
  }

  const parts = actorId.split("/");
  if (parts.length < 3) {
    logging.error("actorId has invalid structure", actorId);
    return null;
  }

  const actorBaseUrl = parts[2];

  if (isValidLemmyDomain(actorBaseUrl)) {
    return actorBaseUrl;
  }

  return null;
}

export function getActorCommunity(actorId: string | undefined): string | null {
  if (typeof actorId !== "string") {
    logging.error("actorId is not a string", actorId);
    return null;
  }

  const parts = actorId.split("/");
  if (parts.length < 5) {
    logging.error("actorId has invalid structure", actorId);
    return null;
  }

  const actorCommunity = parts[4];

  if (!actorCommunity) {
    logging.error("actorId missing community segment", actorId);
    return null;
  }

  return actorCommunity;
}
