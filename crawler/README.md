# Crawler

This is set of nodejs scripts that crawl the Lemmy API and store the data to Redis.
They are also able to generate JSON output bundles for the frontend.

A redis instance must be running on `localhost:6379` for the crawler to store data.
There is a `npx tsx index.js --out` script to output the instances and communities to json for the frontend.

## Basic usage

### How to start crawling

1. Start redis server (`docker compose up -d redis`)

   > Redis server config is in `lib/const.ts`

2. Start crawler (`yarn start`)

   > This will use pm2 to start the crawler in the background.
   > You can use `yarn logs` to monitor the crawler.

3. Put some jobs into the queue (`npx tsx index.js --init`)
   > This will put some jobs into the queue based off the lists in `lib/const.ts`

### Using Docker Compose

The crawler can be run in docker-compose with the following commands.

1. Start redis server in background (`docker compose up -d redis`)

2. Start crawler in foreground (`docker compose up crawler --build`)
   > You can also use `docker compose up -d crawler --build` and then use `docker-compose logs --tail 400 -f crawler` to monitor it.

If you want to configure auto-upload to s3 or anything, you need to copy the `.env.example` to `.env` and edit it.

## CLI Commands

### Tasks

These immediately run a specific task.

`npx tsx index.js [options]`

| Option     | Description                                    |
| ---------- | ---------------------------------------------- |
| `--out`    | Output JSON files for frontend                 |
| `--clean`  | Clean up old jobs                              |
| `--init`   | Initialize queue with seed jobs                |
| `--health` | Check worker health                            |
| `--aged`   | Create jobs for aged instances and communities |
| `--kbin`   | Create jobs for kbin communities               |
| `--uptime` | Immediately crawl uptime data                  |
| `--fedi`   | Immediately crawl Fediseer data                |

#### **Examples**

| Action                                         | Command                     |
| ---------------------------------------------- | --------------------------- |
| Output json output bundles for frontend        | `npx tsx index.js --out`    |
| Initialize queue with seed jobs                | `npx tsx index.js --init`   |
| View worker health                             | `npx tsx index.js --health` |
| Create jobs for aged instances and communities | `npx tsx index.js --aged`   |
| Immediately crawl uptime data                  | `npx tsx index.js --uptime` |

### Start Workers

These start a worker that will run continuously, processing jobs from the relevant queue.

`npx tsx index.js -w [worker_name]`

| Worker         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `-w instance`  | Crawl instances from the queue                                 |
| `-w community` | Crawl communities from the queue                               |
| `-w single`    | Crawl single communities from the queue                        |
| `-w kbin`      | Crawl kbin communities from the queue                          |
| `-w cron`      | Schedule all CRON jobs for aged instances and communities, etc |

#### **Examples**

| Action                | Command                        |
| --------------------- | ------------------------------ |
| Start Instance Worker | `npx tsx index.js -w instance` |
| Start CRON Worker     | `npx tsx index.js -w cron`     |

### Start Manual Jobs

These start a worker that will run a single job, then exit.

`npx tsx index.js -m [worker] [base_url] [community_url]?`

| Worker                                       | Description                                    |
| -------------------------------------------- | ---------------------------------------------- |
| `-m [i\|instance] <base_url>`                | Crawl a single instance                        |
| `-m [c\|community] <base_url>`               | Crawl a single instance's community list       |
| `-m [s\|single] <base_url> <community_name>` | Crawl a single community, delete if not exists |
| `-m [k\|kbin] <base_url>`                    | Crawl a single community                       |

#### **Examples**

| Action                                   | Command                                |
| ---------------------------------------- | -------------------------------------- |
| Crawl a single instance                  | `npx tsx index.js -m i lemmy.tgxn.net` |
| Crawl a single instance's community list | `npx tsx index.js -m c lemmy.tgxn.net` |

## Project Structure

| Directory  | Description                                        |
| ---------- | -------------------------------------------------- |
| `bin/`     | helpers for CLI interface                          |
| `crawler/` | main crawler scripts                               |
| `lib/`     | libraries for crawling, error handling and storage |
| `output/`  | scripts to generate JSON output bundles            |
| `queue/`   | queue processor scripts                            |
| `store/`   | redis storage classes                              |

## Architecture

### Crawlers

Crawlers are tasks created to perform an action, which could be crawling an instance, community, or other data.

| Crawler     | Description        |
| ----------- | ------------------ |
| `instance`  | Instance Crawling  |
| `community` | Community Crawling |
| `fediseer`  | Fediseer Crawling  |
| `uptime`    | Uptime Crawling    |
| `kbin`      | Kbin Crawling      |

### Queues

Queues are where Tasks can be placed to be processed.

| Task               | Description              |
| ------------------ | ------------------------ |
| `instance`         | Crawl an instance        |
| `community_list`   | Crawl a community        |
| `community_single` | Crawl a single community |
| `kbin`             | Crawl a kbin community   |

## Storage

Redis is used to store crawled data.

You can use `docker compose up -d` to start a local redis server.
Data is persisted to a `.data/redis` directory.

| Redis Key      | Description                                           |
| -------------- | ----------------------------------------------------- |
| `attributes:*` | Tracked attribute sets _(change over time)_           |
| `community:*`  | Community details                                     |
| `deleted:*`    | Deleted data _(recycle bin if something broken)_      |
| `error:*`      | Exception details                                     |
| `fediverse:*`  | Fediverse data                                        |
| `instance:*`   | Instance details                                      |
| `last_crawl:*` | Last crawl time for instances and communities         |
| `magazine:*`   | Magazine data _(kbin magazines)_                      |
| `uptime:*`     | Uptime data _(fetched from `api.fediverse.observer`)_ |

Most of the keys have sub keys for the instance `base_url` or community `base_url:community_name`.
