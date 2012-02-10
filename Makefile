# SocketStream Makefile

# Compile all CoffeeScript files within /src into /lib and transfer over any pure JS files
# Messy for now but we can clean it up when we remove the /connect dir
build:
	rm -fr lib; node_modules/coffee-script/bin/coffee --bare -o lib -c src; cp src/*.js lib; cp src/utils/*.js lib/utils; cp src/websocket/transports/socketio/*.js lib/websocket/transports/socketio;  cp -R src/browser_client/libs lib/browser_client; cp -R src/connect lib;

# Ignore files and directories prepended with 'testdata_'
TEST_FILES=`find test/* | grep -v '^test/testdata_*'`
test:
	make build
	./node_modules/.bin/mocha --require should --require coffee-script $(TEST_FILES)

.PHONY: test
