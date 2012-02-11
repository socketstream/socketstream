// Interactive console for testing sending of events etc
// TODO: Find a way to give access to Websocket Message Responders here

var repl = require('repl')
  , ss = require('socketstream');

ss.start();

var cmd = repl.start('SocketStream > ');

cmd.context.ss = ss.api;