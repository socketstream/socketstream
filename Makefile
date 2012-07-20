# SocketStream Makefile

# Compile all CoffeeScript files within /src into /lib and transfer over any pure JS files
# This is ugly! All going to disappear in SocketStream 0.4
build:
	rm -fr lib; node_modules/coffee-script/bin/coffee --bare -o lib -c src; cp src/*.js lib; cp src/utils/*.js lib/utils; cp src/websocket/transports/socketio/*.js lib/websocket/transports/socketio; mkdir lib/client/system/libs; cp -R src/client/system/libs/*.js lib/client/system/libs/; cp -R src/client/system/modules/*.js lib/client/system/modules/;

# Ignore files and directories prepended with 'testdata_'
TEST_FILES=`find test/* | grep -v '^test/testdata_*'`
test:
	./node_modules/.bin/mocha --require should --require coffee-script $(TEST_FILES)

.PHONY: test
