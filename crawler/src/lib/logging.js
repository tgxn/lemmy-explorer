import { LOG_LEVEL } from "../lib/const.js";

// pm2 already writes logs, just make them pretty

const logging = {
  silly: () => {},
  trace: () => {},
  verbose: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
};

export default logging;
