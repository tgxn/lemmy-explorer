// import path from "path";
// import util from "util";

// // import * as winston from "winston";
// // import "winston-daily-rotate-file";

// import logger from "tracer";

// const logging = logger.console({ level: "info" });

import { LOG_LEVEL } from "../lib/const.js";

// // const logPath = path.resolve(process.cwd(), LOG_PATH);

// // const {
// //   combine,
// //   timestamp,
// //   colorize,
// //   simple,
// //   cli,
// //   printf,
// //   json,
// //   splat,
// //   errors,
// // } = winston.format;

// // winston.addColors({ json: "grey" });

// // const myFormatter = winston.format((info) => {
// //   const { message } = info;

// //   const colorizer = winston.format.colorize();

// //   let splatData = info[Symbol.for("splat")];
// //   if (splatData) {
// //     let extraString = JSON.stringify(splatData);

// //     info.message = `${message} ${colorizer.colorize("json", extraString)}`;

// //     delete info[Symbol.for("splat")]; // We added `data` to the message so we can delete it
// //   }

// //   return {
// //     level: info.level,
// //     message: info.message,
// //   };
// // })();

// // const winstonLogger = winston.createLogger({
// //   transports: [
// //     new winston.transports.DailyRotateFile({
// //       level: "debug",
// //       filename: path.join(logPath, "crawler-%DATE%.log"),
// //       datePattern: "YYYY-MM-DD-HH",
// //       maxSize: "20m",
// //       maxFiles: 10,
// //       format: combine(timestamp(), simple(), errors({ stack: true })),
// //     }),
// //     new winston.transports.Console({
// //       level: "debug",
// //       format: combine(colorize(), myFormatter, simple()),
// //     }),
// //   ],
// // });

const logging = {
  silly: console.debug,
  trace: console.trace,
  verbose: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
};

export default logging;
