.DEFAULT_GOAL := help

## -- Main Methods --

## Launch application and database
.PHONY: init
init:
	docker-compose up

## -- Development Methods --

## Launch services to support development environment
.PHONY: up
up:
	docker-compose -f docker/dev/docker-compose.yml up -d

## Terminate development environment
.PHONY: down
down:
	docker-compose -f docker/dev/docker-compose.yml down

## Tail development service logs
.PHONY: logs
logs:
	docker-compose -f docker/dev/docker-compose.yml logs -f

## Open psql shell to development pg instance
.PHONY: psql
psql:
	psql -h 0.0.0.0 --username postcodesio postcodesiodb

## -- Test Methods --

## Launches test and pg containers with tests running
.PHONY: test
test:
	docker-compose -f docker/test/docker-compose.yml -f docker/test/test.yml up --exit-code-from api --build

## Launch test application and database
.PHONY: test-up
test-up:
	docker-compose -f docker/test/docker-compose.yml up -d --build

## Shut down test services
.PHONY: test-down
test-down:
	docker-compose -f docker/test/docker-compose.yml down

## Shell into test container
.PHONY: test-shell
test-shell:
	docker-compose -f docker/test/docker-compose.yml exec api /bin/bash

## Tail test service logs
.PHONY: test-logs
test-logs:
	docker-compose -f docker/test/docker-compose.yml logs -f

## -- Live Test Methods --

## Build local pg and api images using pg_dump from S3
.PHONY: live-up
live-up:
	docker-compose -f docker/live-test/docker-compose.yml up -d --build

## Shut down live test services
.PHONY: live-down
live-down:
	docker-compose -f docker/live-test/docker-compose.yml down -v

## -- Misc --

## Update repository against origin/master
.PHONY: update
update:
	git fetch
	git merge --ff-only origin/master

## How to use this Makefile
.PHONY: help
help:
	@printf "Usage\n";

	@awk '{ \
			if ($$0 ~ /^.PHONY: [a-zA-Z\-\_0-9]+$$/) { \
				helpCommand = substr($$0, index($$0, ":") + 2); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^[a-zA-Z\-\_0-9.]+:/) { \
				helpCommand = substr($$0, 0, index($$0, ":")); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^##/) { \
				if (helpMessage) { \
					helpMessage = helpMessage"\n                     "substr($$0, 3); \
				} else { \
					helpMessage = substr($$0, 3); \
				} \
			} else { \
				if (helpMessage) { \
					print "\n                     "helpMessage"\n" \
				} \
				helpMessage = ""; \
			} \
		}' \
		$(MAKEFILE_LIST)
