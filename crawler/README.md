# Crawler

The crawler is set of nodejs scripts that crawl the Lemmy API and store the data in Redis.

There is a `npm run output` script to output the instances and communities to json for the frontend.

## Usage





### Basic Usage

#### How to Start Crawling

1. Start redis server (`docker-compose up -d redis`)
 > Redis server config is in `lib/const.js`

2. Start crawler (`npm start`)
 > This will use pm2 to start the crawler in the background.
 > You can use `npm run logs` to monitor the crawler.

3. Put some jobs into the queue (`node index.js --init`)
 > This will put some jobs into the queue based off the lists in `lib/const.js`


### CLI Commands

#### Tasks

`node index.js [options]`

| Option | Description |
| --- | --- |
| --help | output this usage information |
| --version | output the version number |
| --out | Output JSON files for frontend |


#### Start Workers

`node index.js -w [worker_name]`

| Worker | Description |
| --- | --- |
| -w instance | Crawl instances from the queue |
| -w community | Crawl communities from the queue |
| -w single | Crawl single communities from the queue |
| -w kbin | Crawl kbin communities from the queue |
| -w cron | Schedule all CRON jobs for aged instances and communities, etc |


#### Start Manual Jobs

`node index.js -m [worker] [base_url] [community_url]?`

| Worker | Description |
| --- | --- |
| -m [i|instance] <base_url> | Crawl a single instance |
| -m [c|community] <base_url> | Crawl a single instance's community list |
| -m [s|single] <base_url> <community_name> | Crawl a single community, delete if not exists |
| -m [k|kbin] <base_url> | Crawl a single community |



### Output for Frontend

Generate output JSON files:
`node index.js --out`

### Advanced

**Init Queue with Seed jobs**
`node index.js --init`

**Run in single-job mode**
Instance Job: `node index.js -i instance.example.com`
Community Job: `node index.js -c instance.example.com`

**Worker Health**
`node index.js --health`

**Create Jobs for Aged Instances and Communities**
`node index.js --aged`

**Immediately Crawl Uptime Data**
`node index.js --uptime`







# Storage

Redis is used to store crawled data.

You can use `docker-compose up -d` to start a local redis server.
Data is persisted to a `.data/redis` directory.

## Instance
key: `instance:<instance_id>`

stores details returned by the instance-level crawler. 

### Community

### Fediverse

### Failure

### Uptime

