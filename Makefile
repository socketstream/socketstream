# SocketStream Makefile

# Ignore files and directories prepended with 'testdata_'
TEST_FILES=`find test/* | grep -v '^test/testdata_*'`
test:
	./node_modules/.bin/mocha --require should --require coffee-script $(TEST_FILES)

.PHONY: test