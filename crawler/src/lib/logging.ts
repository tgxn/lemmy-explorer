import pino from "pino";
import pretty from "pino-pretty";

import { LOG_LEVEL } from "./const";
const stream = pretty({
  colorize: true,
  translateTime: "yyyy-mm-dd HH:MM:ss",
  ignore: "pid,hostname",

  customLevels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  },

  messageFormat: (log: Record<string, any>, messageKey: string): string => {
    const msg = log[messageKey] as string;
    switch (log.level) {
      case 10:
      case 20:
        return `\x1b[90m${msg}\x1b[0m`; // grey
      case 30:
        return `\x1b[32m${msg}\x1b[0m`; // green
      case 40:
        return `\x1b[33m${msg}\x1b[0m`; // yellow
      case 50:
        return `\x1b[31m${msg}\x1b[0m`; // red
      case 60:
        return `\x1b[1;31m${msg}\x1b[0m`; // bold red
      default:
        return msg;
    }
  },
});

const baseLogger = pino({ level: LOG_LEVEL }, stream);

const formatDuration = (ms: number) => {
  const milliseconds = (ms % 1000).toString().padStart(3, "0");

  const seconds = Math.floor(ms / 1000);
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
};

type ILogFunction = (message: string, ...args: any[]) => void;

type ILogging = {
  trace: ILogFunction;
  debug: ILogFunction;
  info: ILogFunction;
  warn: ILogFunction;
  error: ILogFunction;
  fatal: ILogFunction;
  table: (data: any, columns?: string[]) => void;
  formatDuration: (ms: number) => string;
};

const logging: ILogging = {
  trace: baseLogger.trace.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),
  info: baseLogger.info.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  error: baseLogger.error.bind(baseLogger),
  fatal: baseLogger.fatal.bind(baseLogger),

  table: (data: any, columns?: string[]) => {
    baseLogger.info("table\n" + JSON.stringify(data, null, 2));
    console.table(data, columns);
  },
  formatDuration: formatDuration,
};

export default logging;
