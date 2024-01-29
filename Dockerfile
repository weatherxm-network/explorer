# Base
FROM node:20-alpine as base
RUN apk add git
WORKDIR /src

# Build
FROM base as build
COPY package*.json ./
RUN npm install
COPY . .
RUN GIT_COMMIT_HASH=$(git rev-parse --short HEAD) npm run build
RUN npm prune

# Run
FROM base
ENV PORT=80
ENV HOST=0.0.0.0
COPY --from=build /src/.output /src/.output
CMD [ "node", ".output/server/index.mjs" ]