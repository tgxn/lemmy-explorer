const defaultOptions = {
  log_type: "raw",
  script: "index.ts",
  exec_mode: "fork",
  interpreter: "tsx",
};

module.exports = {
  apps: [
    {
      ...defaultOptions,
      output: "./.data/logs/scheduler.log",
      name: "scheduler",
      args: ["-w", "cron"],
      instances: 1,
    },
    {
      ...defaultOptions,
      output: "./.data/logs/instance.log",
      name: "crawl-instance",
      args: ["-w", "instance"],
      instances: 10,
    },
    {
      ...defaultOptions,
      output: "./.data/logs/community.log",
      name: "crawl-community",
      args: ["-w", "community"],
      instances: 8,
    },
    {
      ...defaultOptions,
      output: "./.data/logs/single.log",
      name: "crawl-one-community",
      args: ["-w", "single"],
      instances: 6,
    },
    {
      ...defaultOptions,
      output: "./.data/logs/mbin.log",
      name: "crawl-mbin",
      args: ["-w", "mbin"],
      instances: 2,
    },
  ],
};
