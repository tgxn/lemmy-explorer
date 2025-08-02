import util from "node:util";

import pino from "pino";
import pretty from "pino-pretty";

import { LOG_LEVEL } from "./const";

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

const levelColours: Record<number, string> = {
  10: "\x1b[90m", // trace - grey
  20: "\x1b[90m", // debug - grey
  30: "\x1b[32m", // info - green
  40: "\x1b[33m", // warn - yellow
  50: "\x1b[31m", // error - red
  60: "\x1b[1;31m", // fatal - bold red
};

const stringifyArg = (arg: any) => {
  if (typeof arg === "string") return arg;
  try {
    const json = JSON.stringify(arg);
    return json === undefined ? String(arg) : json;
  } catch {
    return util.inspect(arg, { depth: null, breakLength: Infinity });
  }
};
const formatMessage = (log: Record<string, any>, messageKey: string) => {
  const baseMsg = log[messageKey] as string;
  const colour = levelColours[log.level] ?? "";
  const reset = colour ? "\x1b[0m" : "";

  return `${colour}${baseMsg}${reset}`;
};
const stream = pretty({
  colorize: true,
  translateTime: "yyyy-mm-dd HH:MM:ss.l",
  ignore: "pid,hostname",

  customLevels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  },

  messageFormat: (log, messageKey) => formatMessage(log, messageKey),
});

const baseLogger = pino({ level: LOG_LEVEL }, stream);

type ILogFunction = (message: string, ...args: any[]) => void;

type ILogging = {
  trace: ILogFunction;
  debug: ILogFunction;
  info: ILogFunction;
  warn: ILogFunction;
  error: ILogFunction;
  fatal: ILogFunction;
  table: (tableTitle: string, ...data: any) => void;
  formatDuration: (ms: number) => string;
};

type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

const buildLog = (level: Level): ILogFunction => {
  return (message: string, ...args: any[]) => {
    const extra = args.map(stringifyArg).join(" ");
    const finalMessage = extra ? `${message} ${extra}` : message;
    (baseLogger as any)[level](finalMessage);
  };
};

const logging: ILogging = {
  trace: buildLog("trace"),
  debug: buildLog("debug"),
  info: buildLog("info"),
  warn: buildLog("warn"),
  error: buildLog("error"),
  fatal: buildLog("fatal"),

  table: (tableTitle: string, ...data: any[]) => {
    console.log();
    console.info(tableTitle);
    console.table(...data);
    console.log();
  },
  formatDuration: formatDuration,
};

export default logging;
