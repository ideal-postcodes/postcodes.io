FROM node:26-slim

RUN apt-get update && \
  apt-get install -y --no-install-recommends openssl bash git postgresql-client ca-certificates wget && \
  rm -rf /var/lib/apt/lists/* && \
  npm install -g corepack && \
  corepack enable

ENV DOCKERIZE_VERSION=v0.16.0
RUN wget -q https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY docker/test/entrypoint.sh /usr/bin/
ENTRYPOINT ["entrypoint.sh"]

WORKDIR /app

# No `pnpm install` here. The docker-compose mount bind-mounts the host repo
# over /app at runtime, so any node_modules baked in here gets shadowed.
# pnpm 11's deps-status-check auto-installs on first script run.

CMD ["tail"]
