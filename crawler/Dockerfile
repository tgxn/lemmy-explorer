FROM node:18

RUN apt-get update
RUN apt-get install bash

ENV NPM_CONFIG_LOGLEVEL trace

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install App
COPY index.js .
COPY package*.json .
COPY ecosystem.config.cjs .
COPY src src/

# Install Dependencies
RUN yarn global add pm2
RUN yarn install

# Run App
CMD [ "pm2-runtime", "--raw", "start", "ecosystem.config.cjs" ]
