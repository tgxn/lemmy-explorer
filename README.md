# Lemmy Explorer

This is a project that aims to provide a simple way to explore Lemmy Instances and Communities.

# Packages

## Crawler

The crawler is set of nodejs scripts that crawl the Lemmy API and store the data in Redis.

There is a `npm run output` script to output the instances and communities to json for the frontend.


## Frontend

The frontend is a React SPA that uses the data from the crawler to display and search the instances and communities.

Data is retrieved using TanStack Query.


## Thanks

https://github.com/LemmyNet/lemmy-stats-crawler


## Similar Sites

https://browse.feddit.de/
https://join-lemmy.org/instances
https://github.com/maltfield/awesome-lemmy-instances
https://lemmymap.feddit.de/

## Lemmy Stats Pages
https://lemmy.fediverse.observer/dailystats
https://the-federation.info/platform/73
https://fedidb.org/

# Credits

Logo made by Andy Cuccaro (@andycuccaro) under the CC-BY-SA 4.0 license.

