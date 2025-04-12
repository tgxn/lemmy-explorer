FROM node:22

RUN apt-get update
RUN apt-get install bash

ENV NPM_CONFIG_LOGLEVEL trace

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install App
COPY index.ts .
COPY package.json .
COPY yarn.lock .
COPY ecosystem.config.cjs .
COPY src src/

# Install Dependencies
RUN yarn global add tsx

RUN yarn global add pm2

# logrotate
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:retain 7

RUN yarn install

# Run App
CMD [ "pm2-runtime", "--raw", "start", "ecosystem.config.cjs" ]
