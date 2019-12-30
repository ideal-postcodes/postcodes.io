.DEFAULT_GOAL := help

## -- Main Methods --

## Launch application and database
.PHONY: init
init:
	docker-compose up

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
