import logging from "../lib/logging";

export default class OutputClassifier {
  // given an error message from redis, figure out what it relates to..
  static findErrorType(errorMessage: string): string {
    // console.log("findErrorType", errorMessage);

    if (!errorMessage || errorMessage.length === 0) {
      logging.error("empty error message");
      return "unknown";
    }

    if (errorMessage.includes("EAI_AGAIN")) {
      return "dnsFailed";
    }

    if (errorMessage.includes("ENETUNREACH") || errorMessage.includes("EHOSTUNREACH")) {
      return "hostUnreachable";
    }

    if (errorMessage.includes("ECONNREFUSED")) {
      return "connectRefused";
    }

    if (
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("EPROTO") ||
      errorMessage.includes("socket hang up") ||
      errorMessage.includes("Request failed with status code 522") ||
      errorMessage.includes("Client network socket disconnected")
    ) {
      return "connectException";
    }

    if (
      errorMessage.includes("ENOENT") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("Request failed with status code 401")
    ) {
      return "contentMissing";
    }

    if (errorMessage.includes("timeout of")) {
      return "timeout";
    }

    if (
      errorMessage.includes("self-signed certificate") ||
      errorMessage.includes("does not match certificate's altnames") ||
      errorMessage.includes("tlsv1 unrecognized name") ||
      errorMessage.includes("tlsv1 alert internal error") ||
      errorMessage.includes("ssl3_get_record:wrong version number") ||
      errorMessage.includes("unable to verify the first certificate") ||
      errorMessage.includes("unable to get local issuer certificate") ||
      errorMessage.includes("certificate has expired")
    ) {
      return "sslException";
    }

    if (errorMessage.includes("baseUrl is not a valid domain")) {
      return "invalidBaseUrl";
    }

    if (
      errorMessage.includes("code 300") ||
      errorMessage.includes("code 400") ||
      errorMessage.includes("code 403") ||
      errorMessage.includes("code 404") ||
      errorMessage.includes("code 406") ||
      errorMessage.includes("code 410") ||
      errorMessage.includes("code 500") ||
      errorMessage.includes("code 502") ||
      errorMessage.includes("code 503") ||
      errorMessage.includes("code 520") ||
      errorMessage.includes("code 521") ||
      errorMessage.includes("code 523") ||
      errorMessage.includes("code 525") ||
      errorMessage.includes("code 526") ||
      errorMessage.includes("code 530") ||
      errorMessage.includes("Maximum number of redirects exceeded")
    ) {
      return "httpException";
    }

    if (
      errorMessage.includes("no diaspora rel in") ||
      errorMessage.includes("wellKnownInfo.data.links is not iterable") ||
      errorMessage.includes("missing /.well-known/nodeinfo links")
    ) {
      return "httpException";
    }

    if (errorMessage.includes("not a lemmy instance")) {
      return "notLemmy";
    }

    if (
      errorMessage.includes("invalid actor id") ||
      errorMessage.includes("actor id does not match instance domain")
    ) {
      return "invalidActorId";
    }

    logging.trace("unhandled error", errorMessage);
    return "unknown";
  }
}
