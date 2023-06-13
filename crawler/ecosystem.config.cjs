module.exports = {
  apps: [
    {
      name: "scheduler",
      script: "index.js",
      args: ["--cron"],
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
      instances: 2,
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
