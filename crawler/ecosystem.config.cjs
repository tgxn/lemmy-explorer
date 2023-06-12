module.exports = {
  apps: [
    {
      name: "main",
      script: "./index.js",
      watch: true,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "crawl-instance",
      script: "./index.js",
      args: ["-q", "instance"],
      watch: true,
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
      script: "./index.js",
      args: ["-q", "community"],
      watch: true,
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
