var assert = require('assert');
var child_process = require('child_process');
var cluster = require('cluster');
var dgram = require('dgram');
var dns = require('dns');
var net = require('net');
var readline = require('readline');
var repl = require('repl');
var tls = require('tls');

assert(child_process.exec);
assert(cluster.fork);
assert(dgram.Socket);
assert(dns.lookup);
assert(net.createServer);
assert(readline.cursorTo);
assert(repl.start);
assert(tls.connect);

console.log('Node-only tests completed successfully.');