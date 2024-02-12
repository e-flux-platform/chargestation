FROM --platform=linux/amd64 node:16.20.2-alpine

# Set work directory
WORKDIR /service

# Yarn will not install any package listed in devDependencies if the NODE_ENV
# environment variable is set to production. Use this flag to instruct Yarn to
# ignore NODE_ENV and take its production-or-not status from this flag instead.
ENV NODE_ENV=production

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
