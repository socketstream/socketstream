// SocketStream Client

window.$SS = {
  cb_stack: {},
  events: {},
  config: { 
    log_level: 0 // no client-side logging by default
  },  
};

// Make the exports variable global so we can access code placed in /app/shared
window.exports = {};

// Cookies are set by the browser, not via the server in HTTP headers to allow full caching of the static index.html file
window.getCookie = function(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";",c_start);
      if (c_end == -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start,c_end));
    }
  }
  return "";
};

window.setCookie = function(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
};

// Setup the websocket connection
$SS.socket = new io.Socket(document.location.hostname, {
  rememberTransport: false,
  port: document.location.port,
  secure: false,
  transports: ['websocket', 'flashsocket'],
  tryTransportsOnConnectTimeout: false
});

$SS.processors = {

  system: function(data) {
    switch(data.method) {
      case 'ready':
        $SS.socket.ready = true;
        break;
      case 'setSession':
        setCookie('session_id', data.params);
        if ($SS.config.log_level >= 2) console.log('-> Started new session: ' + data.params);
        break;
      case 'setConfig':
        $SS.config = data.params || {};
        break;
      case 'error':
        if ($SS.config.log_level >= 1) console.error('SocketStream Error: ' + data.params[1]);
        break;
    };
  },
  
  callback: function(data) {
    var cb = $SS.cb_stack[data.cb_id];
    var silent = (cb.options && cb.options.silent);
    if ($SS.config.log_level >= 2 && !silent) console.log('-> ' + data.callee);
    if (data.params && $SS.config.log_level >= 3 && !silent) console.log(data.params);
    cb(data.params);
    delete $SS.cb_stack[data.cb_id];
  },
  
  event: function(data) {
    if ($SS.config.log_level >= 2) console.log('=> ' + data.event);
    $SS.events[data.event](data.params);
  }
};

$SS.socket.on('message', function(raw) {
  data = JSON.parse(raw);
  if (!data.type) data.type = 'event';
  $SS.processors[data.type](data);
});

window.remote = function() {
  var args = arguments;
  var method = args[0];
  var callback = args[args.length - 1];
  var params = args.length >= 3 ? args[1] : null;
  var options = args.length >= 4 ? args[2] : null;
  
  callback.options = options;
  if ($SS.socket.connected == false && $SS.socket.connecting == false) {
    $SS.socket.ready = false; $SS.socket.connect();
  } else {
    if ($SS.socket.ready == true) {
      var cb_id = null;
      cb_id = Math.random().toString().split('.')[1];
      window.$SS.cb_stack[cb_id] = callback;
      if (window.debug && !(options && options.silent)) console.log('<- ' + method);
      $SS.socket.send(JSON.stringify({method: method, params: params, cb_id: cb_id, callee: method, options: options}));
    } else {
      setTimeout(function(){ remote.apply(this, args); }, 50); 
    };
  };
};

$SS.socket.connect(); 
