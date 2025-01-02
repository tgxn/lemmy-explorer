const defaultOptions = {
  log_type: "raw",
  output: "./logs/out.log",
  script: "index.ts",
  exec_mode: "fork",
  interpreter: "node",
};

module.exports = {
  apps: [
    {
      ...defaultOptions,
      name: "scheduler",
      args: ["-w", "cron"],
      instances: 1,
    },
    {
      ...defaultOptions,
      name: "crawl-instance",
      args: ["-w", "instance"],
      instances: 10,
    },
    {
      ...defaultOptions,
      name: "crawl-community",
      args: ["-w", "community"],
      instances: 8,
    },
    {
      ...defaultOptions,
      name: "crawl-one-community",
      args: ["-w", "single"],
      instances: 4,
    },
    {
      ...defaultOptions,
      name: "crawl-kbin",
      args: ["-w", "kbin"],
      instances: 4,
    },
  ],
};
