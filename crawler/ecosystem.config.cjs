module.exports = {
  apps: [
    // {
    //   name: "main",
    //   script: "index.js",
    //   watch: true,
    //   ignore_watch: ["./", "node_modules", ".data"],
    //   env_production: {
    //     NODE_ENV: "production",
    //   },
    //   env_development: {
    //     NODE_ENV: "development",
    //   },
    // },
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
