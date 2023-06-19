FROM node:18

ENV NPM_CONFIG_LOGLEVEL info

# Create app directory
WORKDIR /usr/src/app

# Install App
COPY index.js .
COPY package*.json .
COPY ecosystem.config.cjs .
COPY src src/

# Install Dependencies
RUN npm install pm2 -g
RUN npm ci --only=production

# Run App
CMD [ "pm2-runtime", "--raw", "start", "ecosystem.config.cjs" ]
