module.exports = {
  apps: [
    {
      name: "scheduler",
      script: "index.js",
      args: ["--cron"],
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
      args: ["-q", "instance"],
      instances: 20,
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
      args: ["-q", "community"],
      instances: 10,
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
      args: ["-q", "single"],
      instances: 10,
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
      args: ["-q", "kbin"],
      instances: 4,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
