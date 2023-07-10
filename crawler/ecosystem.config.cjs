module.exports = {
  apps: [
    {
      name: "scheduler",
      script: "index.js",
      args: ["-w", "cron"],
      instances: 1,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "crawl-instance",
      script: "index.js",
      args: ["-w", "instance"],
      instances: 4,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "crawl-community",
      script: "index.js",
      args: ["-w", "community"],
      instances: 4,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "crawl-one-community",
      script: "index.js",
      args: ["-w", "single"],
      instances: 2,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "crawl-kbin",
      script: "index.js",
      args: ["-w", "kbin"],
      instances: 2,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
