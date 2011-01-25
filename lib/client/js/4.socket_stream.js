// SocketStream Client

window._ss = {
  cb_stack: {},
  listeners: {}
};

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

_ss.socket = new io.Socket(document.location.hostname, {
  rememberTransport: false,
  port: document.location.port,
  secure: false,
  transports: ['websocket', 'flashsocket'],
  tryTransportsOnConnectTimeout: false
});

_ss.processors = {

  system: function(data) {
    switch(data.method) {
      case 'ready':
        _ss.socket.ready = true;
        if (window.debug_level >= 2) console.log('-> SocketStream server ready');
        break;
      case 'setSession':
        setCookie('session_id', data.params);
        if (window.debug_level >= 2) console.log('-> Started new session: ' + data.params);
        break;
    };
  },
  
  callback: function(data) {
    var cb = _ss.cb_stack[data.cb_id];
    var silent = (cb.options && cb.options.silent);
    if (window.debug_level >= 2 && !silent) console.log('-> ' + data.callee);
    if (data.params && window.debug_level >= 3 && !silent) console.log(data.params);
    cb(data.params);
    delete _ss.cb_stack[data.cb_id];
  },
  
  event: function(data) {
    console.log(data);
    try {
      _ss.listeners[data.listener](data.params);
    } catch(e) {
      console.error(e);
    };
  }
};

_ss.socket.on('message', function(raw) {
  data = JSON.parse(raw);
  _ss.processors[data.type](data);
});

window.remote = function() {
  var args = arguments;
  var method = args[0];
  var callback = args[args.length - 1];
  var params = args.length >= 3 ? args[1] : null;
  var options = args.length >= 4 ? args[2] : null;
  
  callback.options = options;
  if (_ss.socket.connected == false && _ss.socket.connecting == false) {
    _ss.socket.ready = false; _ss.socket.connect();
  } else {
    if (_ss.socket.ready == true) {
      var cb_id = null;
      cb_id = Math.random().toString().split('.')[1];
      window._ss.cb_stack[cb_id] = callback;
      if (window.debug && !(options && options.silent)) console.log('<- ' + method);
      _ss.socket.send(JSON.stringify({method: method, params: params, cb_id: cb_id, callee: method, options: options}));
    } else {
      setTimeout(function(){ remote.apply(this, args); }, 50); 
    };
  };
};


_ss.socket.connect(); 
