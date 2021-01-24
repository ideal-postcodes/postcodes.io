FROM node:14-alpine AS base

RUN apk update && apk upgrade && apk add --no-cache bash

WORKDIR /app

COPY . .

RUN npm install --no-package-lock && \
    npm cache clean --force && \
    npm run build

FROM base AS install

ARG PORT=8000
ENV PORT $PORT
EXPOSE $PORT

RUN npm install --only=production --no-package-lock && \
    npm cache clean --force

USER node

COPY ./public ./dist/public

WORKDIR /app/dist

HEALTHCHECK --interval=5s CMD node healthcheck.js

CMD [ "node", "server.js" ]
