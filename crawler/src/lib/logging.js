import path from "path";

import * as winston from "winston";
import "winston-daily-rotate-file";

import { LOG_PATH } from "../lib/const.js";

const logPath = path.resolve(process.cwd(), LOG_PATH);

const { combine, timestamp, colorize, simple, cli, json } = winston.format;

const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      level: "debug",
      filename: path.join(logPath, "crawler-%DATE%.log"),
      datePattern: "YYYY-MM-DD-HH",
      maxSize: "20m",
      maxFiles: 10,
      format: combine(timestamp(), simple()),
    }),
    new winston.transports.Console({
      level: "debug",
      format: combine(colorize(), cli(), simple()),
    }),
  ],
});

const wrapper = (original) => {
  return (message, ...args) => {
    const meta = args[0] ? args[0] : null;
    return original(message, meta);
  };
};

winstonLogger.error = wrapper(winstonLogger.error);
winstonLogger.warn = wrapper(winstonLogger.warn);
winstonLogger.info = wrapper(winstonLogger.info);
winstonLogger.verbose = wrapper(winstonLogger.verbose);
winstonLogger.debug = wrapper(winstonLogger.debug);
winstonLogger.silly = wrapper(winstonLogger.silly);

// add wrapper protoype to console.log to winstonLogger
console.log = wrapper(winstonLogger.info);
console.info = wrapper(winstonLogger.info);

export default winstonLogger;
