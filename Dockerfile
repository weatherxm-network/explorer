# Base
FROM node:20-alpine AS base
ENV YARN_VERSION=4.3.0

RUN apk update && apk upgrade && apk add git

# prepare yarn
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

# set workdir
WORKDIR /src

# Build
FROM base as build
COPY package*.json ./
COPY . .

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

RUN GIT_COMMIT_HASH=$(git rev-parse --short HEAD) yarn build

# Run
FROM base
ENV PORT=80
ENV HOST=0.0.0.0
COPY --from=build /src/.output /src/.output
CMD [ "node", ".output/server/index.mjs" ]
