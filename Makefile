# SocketStream Makefile

# Compile all CoffeeScript files within /src into /lib and transfer over any pure JS files
# TODO: Find a better way to move .js files over from /src to /lib, maybe using mkdir -p if the dirs don't already exist
build:
	rm -fr lib; node_modules/coffee-script/bin/coffee --bare -o lib -c src; cp src/*.js lib; cp src/utils/*.js lib/utils; cp src/websocket/transports/socketio/*.js lib/websocket/transports/socketio; cp -R src/browser_client/libs lib/browser_client;  cp -R src/browser_client/*.js lib/browser_client; cp -R src/browser_client/system_modules/*.js lib/browser_client/system_modules;

# Ignore files and directories prepended with 'testdata_'
TEST_FILES=`find test/* | grep -v '^test/testdata_*'`
test:
	./node_modules/.bin/mocha --require should --require coffee-script $(TEST_FILES)

.PHONY: test
