# Contributing

Firstly, Thankyou for considering contributing to the project!

## Developing

Check the readme in each module for further dev instructions:
  [crawler/](crawler/README.md)
  [frontend/](frontend/README.md)
  [pages/](pages/README.md)

## Merge Requests

Please create your merge requests against the `develop` branch, which once merged will deploy changes for `develop.lemmyverse.net` before merging with `main`.

## Code Style

All modules of the project use [Prettier](https://prettier.io/) to do code formatting, and there is a `.prettierrc.json` file in most modules which configure their coding style.

Please run `yarn format:check` in whatever module you're working on before committing :) (or better yet, set up format on save!)
