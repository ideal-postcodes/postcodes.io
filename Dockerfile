FROM node:10-alpine

WORKDIR /usr/src/app

ARG PORT=8000
ENV PORT $PORT
EXPOSE $PORT

HEALTHCHECK --interval=5s CMD node healthcheck.js

COPY package.json .

RUN npm install --only=production --no-package-lock && \
    npm cache clean --force

COPY . .

USER node

CMD [ "node", "server.js" ]

