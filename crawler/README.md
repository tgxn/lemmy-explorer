# Crawler

The crawler is set of nodejs scripts that crawl the Lemmy API and store the data in Redis.

There is a `npm run output` script to output the instances and communities to json for the frontend.

## Usage

### Basic Usage

1. Start redis server (`docker-compose up -d`)
 > Redis server config is in `lib/const.js`

2. Start crawler (`npm start`)
 > This will use pm2 to start the crawler in the background.
 > You can use `npm run logs` to monitor the crawler.

3. Put some jobs into the queue (`node index.js --init`)
 > This will put some jobs into the queue based off the lists in `lib/const.js`


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

