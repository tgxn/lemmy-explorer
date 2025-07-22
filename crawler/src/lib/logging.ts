// import { LOG_LEVEL } from "./const";

// pm2 already writes logs, just make them pretty

const logging = {
  silly: (...args: any) => {},
  trace: console.trace,
  verbose: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,

  nicetime: (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) {
      return `${months}mo+`;
    } else if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}.${milliseconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}.${milliseconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}.${milliseconds}s`;
    } else {
      return `${seconds}.${milliseconds}s`;
    }
  },
};

export default logging;
