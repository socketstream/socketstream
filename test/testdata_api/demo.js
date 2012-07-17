// Server-side Code

// Define actions which can be called from the client using ss.rpc('demo.ACTIONNAME', param1, param2...)
exports.actions = function(req, res, ss) {

  // Example of pre-loading sessions into req.session using internal middleware
  req.use('session');

  req.use('example.authenticated')
  req.use('test.doNothing')

  return {

    sendMessage: function(message) {
      if (message && message.length > 0) {         // Check for blank messages
        ss.publish.all('newMessage', message);     // Broadcast the message to everyone
        return res(true);                          // Confirm it was sent to the originating client
      } else {
        return res(false);
      }
    }

  };

};
