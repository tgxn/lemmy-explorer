FROM node:22.17-alpine

RUN apk add --no-cache bash

# Install Dependencies
RUN yarn global add tsx pm2

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /data/checkpoint
WORKDIR /usr/src/app

# Install App
COPY index.ts .
COPY package.json .
COPY yarn.lock .
COPY ecosystem.config.cjs .
COPY src src/

# Own the app directory and switch to the crawl user
RUN chown -R 1000:1000 /usr/src/app
RUN chown -R 1000:1000 /data/checkpoint
USER 1000:1000

RUN yarn install

# logrotate
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:retain 7

# Run App
CMD [ "pm2-runtime", "--raw", "start", "ecosystem.config.cjs" ]
