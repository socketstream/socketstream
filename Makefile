# SocketStream Makefile

TEST_FILES=`find test/unit/*`
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--compilers coffee:coffee-script \
		$(TEST_FILES)

.PHONY: test