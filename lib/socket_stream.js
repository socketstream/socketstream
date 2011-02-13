require('./globals');

exports.init = function() {
  $SS.root = fs.realpathSync();
  _mergeConfigFiles();
  return this;
};

exports.start = function() {
  $SS.sys.asset.init();
  $SS.config.pack_assets ? $SS.sys.asset.pack.all() : $SS.sys.asset.monitor();
  $SS.sys.server.start();
};

// Merges custom app config specificed in /config/environments/NODE_ENV.js with SocketStream defaults if the file exists
function _mergeConfigFiles() {

  try {
    var config_file_name = ('/config/environments/' + $SS.env + '.json');
    var config_file_body = fs.readFileSync($SS.root + config_file_name, 'utf-8');
    
    try {
      var app_config = JSON.parse(config_file_body);
      try {
        $SS.config = Object.extend($SS.config, app_config);
      } catch(e) {
        console.error('App config file loaded and parsed but unable to merge. Check syntax carefully.');
      }
    } catch (e) {
      console.error('Loaded, but unable to parse app config file ' + config_file_name + '. Ensure it is in valid JSON format with quotes around all strings.');
    }

  } catch (e) {
    sys.log('Note: App config file ' + config_file_name + ' does not exist. Using SocketStream default configuration.');
  }
};
