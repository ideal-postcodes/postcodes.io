FROM node:20-alpine AS base

RUN apk update && apk upgrade && apk add --no-cache bash

WORKDIR /app

COPY . .

RUN npm ci && \
    npm cache clean --force && \
    npm run build

FROM base AS install

ARG PORT=8000
ENV PORT $PORT
EXPOSE $PORT

USER node

COPY ./public ./dist/public

WORKDIR /app/dist

HEALTHCHECK --interval=5s CMD node healthcheck.js

CMD [ "node", "server.js" ]
