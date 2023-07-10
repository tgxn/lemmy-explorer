const defaultOptions = {
  // log_type: "raw",

  // log_file: "/logs/combined.log",
  combine_logs: true,

  output: "/logs/out.log",
  error: "/logs/error.log",
  log: "/logs/combined.outerr.log",

  // autorestart: true,
  script: "index.js",
};

module.exports = {
  apps: [
    {
      ...defaultOptions,
      name: "scheduler",
      args: ["-w", "cron"],
      exec_mode: "fork",
      instances: 1,
    },
    {
      ...defaultOptions,
      name: "crawl-instance",
      args: ["-w", "instance"],
      exec_mode: "fork",
      instances: 4,
    },
    {
      ...defaultOptions,
      name: "crawl-community",
      args: ["-w", "community"],
      exec_mode: "fork",
      instances: 4,
    },
    {
      ...defaultOptions,
      name: "crawl-one-community",
      args: ["-w", "single"],
      exec_mode: "fork",
      instances: 2,
    },
    {
      ...defaultOptions,
      name: "crawl-kbin",
      args: ["-w", "kbin"],
      exec_mode: "fork",
      instances: 2,
    },
  ],
};
