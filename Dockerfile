# alpine3.18 is used because of the issue with 'sharp' https://github.com/nodejs/docker-node/issues/2009#issuecomment-1855547128
FROM --platform=linux/amd64 node:20-alpine3.18

# Set work directory
WORKDIR /service

# Note layers should be ordered from less to more likely to change.

# Update & install required packages
RUN apk add --update bash curl;

# Install dependencies
COPY yarn.lock yarn.lock
COPY package.json package.json

COPY serve/yarn.lock serve/yarn.lock
COPY serve/package.json serve/package.json

#RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy app source
COPY . .

# Build and store webpack cache
RUN --mount=type=cache,target=./.webpack-cache yarn build

RUN rm -rf src/
RUN rm -rf node_modules/

EXPOSE 2200

CMD ["yarn", "run", "static"]
