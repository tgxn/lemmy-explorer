# Crawler

This is set of nodejs scripts that crawl the Lemmy API and store the data to Redis.
They are also able to generate JSON output bundles for the frontend.

A redis instance must be running on `localhost:6379` for the crawler to store data.
There is a `node index.js --out` script to output the instances and communities to json for the frontend.


## Basic usage

### How to start crawling

1. Start redis server (`docker-compose up -d redis`)
 > Redis server config is in `lib/const.js`

2. Start crawler (`npm start`)
 > This will use pm2 to start the crawler in the background.
 > You can use `npm run logs` to monitor the crawler.

3. Put some jobs into the queue (`node index.js --init`)
 > This will put some jobs into the queue based off the lists in `lib/const.js`


### Using Docker Compose

The crawler can be run in docker-compose with the following commands.

1. Start redis server in background (`docker-compose up -d redis`)

2. Start crawler in foreground (`docker-compose up crawler --build`)
 > You can also use `docker-compose up -d crawler --build` and then use `docker-compose logs --tail 400 -f crawler` to monitor it.

If you want to configure auto-upload to s3 or anything, you need to copy the `.env.example` to `.env` and edit it.

## CLI Commands

### Tasks

`node index.js [options]`

| Option | Description |
| --- | --- |
| `--out` | Output JSON files for frontend |
| `--clean` | Clean up old jobs |
| `--init` | Initialize queue with seed jobs |
| `--health` | Check worker health |
| `--aged` | Create jobs for aged instances and communities |
| `--kbin` | Create jobs for kbin communities |
| `--uptime` | Immediately crawl uptime data |
| `--fedi` | Immediately crawl Fediseer data |


#### **Examples**

| Action | Command |
| --- | --- |
| Output json output bundles for frontend | `node index.js --out` |
| Initialize queue with seed jobs | `node index.js --init` |
| View worker health | `node index.js --health` |
| Create jobs for aged instances and communities | `node index.js --aged` |
| Immediately crawl uptime data | `node index.js --uptime` |


### Start Workers

`node index.js -w [worker_name]`

| Worker | Description |
| --- | --- |
| `-w instance` | Crawl instances from the queue |
| `-w community` | Crawl communities from the queue |
| `-w single` | Crawl single communities from the queue |
| `-w kbin` | Crawl kbin communities from the queue |
| `-w cron` | Schedule all CRON jobs for aged instances and communities, etc |

#### **Examples**

| Action | Command |
| --- | --- |
| Start Instance Worker | `node index.js -w instance` |
| Start CRON Worker | `node index.js -w cron` |



### Start Manual Jobs

`node index.js -m [worker] [base_url] [community_url]?`

| Worker | Description |
| --- | --- |
| `-m [i\|instance] <base_url>` | Crawl a single instance |
| `-m [c\|community] <base_url>` | Crawl a single instance's community list |
| `-m [s\|single] <base_url> <community_name>` | Crawl a single community, delete if not exists |
| `-m [k\|kbin] <base_url>` | Crawl a single community |

#### **Examples**

| Action | Command |
| --- | --- |
| Crawl a single instance | `node index.js -m i instance.example.com` |
| Crawl a single instance's community list | `node index.js -m c instance.example.com` |



# Storage

Redis is used to store crawled data.

You can use `docker-compose up -d` to start a local redis server.
Data is persisted to a `.data/redis` directory.

| Redis Key | Description |
| --- | --- |
| `attributes:*` | Tracked attribute sets _(change over time)_ |
| `community:*` | Community details |
| `deleted:*` | Deleted data _(recycle bin if something broken)_ |
| `error:*` | Exception details |
| `fediverse:*` | Fediverse data |
| `instance:*` | Instance details |
| `last_crawl:*` | Last crawl time for instances and communities |
| `magazine:*` | Magazine data _(kbin magazines)_ |
| `uptime:*` | Uptime data _(fetched from `api.fediverse.observer`)_ |

Most of the keys have sub keys for the instance `base_url` or community `base_url:community_name`.


