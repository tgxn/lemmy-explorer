# Lemmy Explorer (https://lemmyverse.net/)

This project provides a simple way to explore Lemmy Instances and Communities.

![List of Communities](./docs/images/communities.png)

The project consists of three modules:
1. Crawler (NodeJS, Redis)
2. Frontend (ReactJS, MUI Joy, TanStack)
3. Deploy (Amazon CDK v2)


## Crawler

[Crawler README](./crawler/README.md)

### Data

Static dumps from the last time I ran the dump are stored in [`./frontend/public/`](./frontend/public/).

- `communities.json` - list of all communities
- `instances.json` - list of all instances
- `overview.json` - metadata and counts


## 2. Frontend

[Frontend README](./frontend/README.md)



## Deploy

The deploy is an Amazon CDK v2 project that deploys the crawler and frontend to AWS.

`config.example.json` has the configuration for the deploy.

then run `cdk deploy --all` to deploy the frontend to AWS.




## Similar Sites

- https://browse.feddit.de/
- https://join-lemmy.org/instances
- https://github.com/maltfield/awesome-lemmy-instances
- https://lemmymap.feddit.de/
- https://browse.toast.ooo/

## Lemmy Stats Pages
- https://lemmy.fediverse.observer/dailystats
- https://the-federation.info/platform/73
- https://fedidb.org/

## Thanks / Related Lemmy Tools

- https://github.com/db0/fediseer
- https://github.com/LemmyNet/lemmy-stats-crawler

# Credits

Logo made by Andy Cuccaro (@andycuccaro) under the CC-BY-SA 4.0 license.

