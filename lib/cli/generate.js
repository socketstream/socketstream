/**
 * New App Generator
 * -----------------
 * Generates skeleton files needed to create a new SocketStream application
 */

'use strict';

require('colors');

var fs       = require('fs'),
    path     = require('path'),
    log      = console.log,
    dir_mode = '0755',

    // Private
    success = function(name, alternative) {
      return log(' ✓'.green, name, (alternative || '').grey);
    },

    // TODO - investigate whether this would be better
    // using the async version of fs.mkdir - PJENSEN
    makeRootDirectory = function(name) {
      try {
        fs.mkdirSync(name, dir_mode); // Create the root directory
        return true;
      } catch (e) {
        if (e.code === 'EEXIST') {
          log('Sorry the \'' + name + '\' directory already exists. Please choose another name for your app.');
          return false;
        } else {
          throw e;
        }
      }
  };

exports.generate = function(program) {

  var appjs,
      codeExtension = program.coffee && 'coffee' || 'js',
      selectedFormatters = [],
      name               = program.args[1],
      source             = path.join(__dirname, '../../new_project'),
      viewExtension      = program.jade && 'jade' || 'html',
      mods               = [],
      packagejs          = '',
      clientFiles        = {
        css: [],
        code: []
      },

      /**
       * [mkdir description]
       * @param  {String}   dir Directory path to create
       * @return {Boolean}      True if directory successfully created
       */
      mkdir = function(dir) {
        return fs.mkdirSync(path.join(name, dir), dir_mode);
      },

      /**
       * Copy files/directories
       * @param  {[String} src  Copy From directory
       * @param  {[String} dest Copy To directory
       * @return {Object}       Stream object
       */
      cp = function(src, dest) {
        var destination = path.join(name, dest || src),
            read        = fs.createReadStream(path.join(source, src)),
            write       = fs.createWriteStream(destination);

        return read.pipe(write);
      },

      /**
       * Wrights contend to the certain file
       * @param  {String} fileName File to wright
       * @param  {[type]} content  Content string
       * @return {Boolean}
       */
      write = function(fileName, content) {
        return fs.writeFileSync(path.join(name, fileName), content, 'utf8');
      };

  /* Check for appleacation name existing */
  if (name === void 0) {
    return log('Please provide a name for your application: $> socketstream new <MyAppName>');
  }

  if (makeRootDirectory(name)) {

    /* Force stylus for now */
    program.stylus = true;

    ['coffee', 'jade', 'less', 'stylus'].forEach(function(formatter) {
      if (program[formatter]) {
        return selectedFormatters.push(formatter);
      }
    });

    /* Create essential directories */
    mkdir('/client');
    mkdir('/client/code');
    mkdir('/client/code/app');
    mkdir('/client/code/libs');
    mkdir('/client/views');
    mkdir('/client/css');
    mkdir('/client/css/libs');
    mkdir('/client/templates');
    mkdir('/client/static');
    mkdir('/client/static/images');
    mkdir('/server');
    mkdir('/server/rpc');
    mkdir('/server/middleware');

    /* Copy essential files */
    cp('/scm_ignore_file', '/.gitignore');
    cp('/node_monitor_ignore_file', '/.nodemonignore');
    cp('/README.md');
    cp('/client/static/favicon.ico');
    cp('/client/code/libs/jquery.min.js');
    cp('/client/code/app/entry.' + codeExtension);
    clientFiles.code.push('libs/jquery.min.js');
    clientFiles.code.push('app');

    /* Install chat demo files */
    if (program.minimal) {
      cp('/client/views/app.minimal.' + viewExtension, '/client/views/app.' + viewExtension);
      cp('/client/code/app/app.minimal.' + codeExtension, '/client/code/app/app.' + codeExtension);
      cp('/client/css/app.minimal.styl', '/client/css/app.styl');
      cp('/server/rpc/.gitkeep');
      cp('/server/middleware/.gitkeep');
      cp('/client/templates/.gitkeep');
      clientFiles.css.push('app.styl');
    } else {
      cp('/client/static/images/logo.png');
      cp('/client/code/app/app.demo.' + codeExtension, '/client/code/app/app.' + codeExtension);
      cp('/server/middleware/example.' + codeExtension);
      cp('/server/rpc/demo.' + codeExtension);
      cp('/client/css/libs/reset.css');
      cp('/client/css/app.demo.styl', '/client/css/app.styl');
      mkdir('/client/templates/chat');
      cp('/client/templates/chat/message.' + viewExtension);
      cp('/client/views/app.demo.' + viewExtension, '/client/views/app.' + viewExtension);
      clientFiles.css.push('libs/reset.css');
      clientFiles.css.push('app.styl');
    }

    /* Generate app.js */
    appjs = "// My SocketStream 0.3 app\n\nvar http = require('http'),\n    ss = require('socketstream');\n\n// Define a single-page client called 'main'\nss.client.define('main', {\n  view: 'app." + viewExtension + "',\n  css:  ['" + (clientFiles.css.join("', '")) + "'],\n  code: ['" + (clientFiles.code.join("', '")) + "'],\n  tmpl: '*'\n});\n\n// Serve this client on the root URL\nss.http.route('/', function(req, res){\n  res.serveClient('main');\n});\n";

    /* List any selected formatters */
    if (selectedFormatters.length > 0) {
      appjs += '\n// Code Formatters\n';
    }
    selectedFormatters.forEach(function(name) {
      return appjs += "ss.client.formatters.add(require('ss-" + name + "'));\n";
    });
    appjs += "\n// Use server-side compiled Hogan (Mustache) templates. Others engines available\nss.client.templateEngine.use(require('ss-hogan'));\n\n// Minimize and pack assets if you type: SS_ENV=production node app.js\nif (ss.env === 'production') ss.client.packAssets();\n\n// Start web server\nvar server = http.Server(ss.http.middleware);\nserver.listen(3000);\n";
    if (program.repl) {
      appjs += '\n// Start Console Server (REPL)\n// To install client: sudo npm install -g ss-console\n// To connect: ss-console <optional_host_or_port>\nvar consoleServer = require(\'ss-console\')(ss);\nconsoleServer.listen(5000);\n';
    }
    appjs += '\n// Start SocketStream\nss.start(server);';
    write('/app.js', appjs);

    /* Generate package.json */
    packagejs = "{\n  \"name\": \"" + name + "\",\n  \"description\": \"An awesome real time application\",\n  \"version\": \"0.0.1\",\n  \"author\": \"Me <me@mydomain.com>\",\n  \"private\": true,\n  \"engines\": { \"node\": \">= 0.6.0\" },\n  \"dependencies\": {\n";
    packagejs += "    \"socketstream\": \"0.3.x\"";
    mods = selectedFormatters.concat(['hogan']);
    if (program.repl) {
      mods.push('console');
    }
    mods.forEach(function(name) {
      return packagejs += ",\n    \"ss-" + name + "\": \"0.1.x\"";
    });

    packagejs += "\n  },\n  \"scripts\":{\n    \"start\":\"node app.js\"\n  }\n}";
    write('/package.json', packagejs);

    /* Show finish text */
    log(('Success! Created app \'' + name + '\' with:').yellow);

    if (program.minimal) {
      success('Minimal install (no demo)');
    } else {
      success('Basic chat demo', '(-m for minimal install)');
    }
    if (program.coffee) {
      success('CoffeeScript example code');
    } else {
      success('Javascript example code', '(-c if you prefer CoffeeScript)');
    }
    if (program.jade) {
      success('Jade for views');
    } else {
      success('Plain HTML for views', '(-j if you prefer Jade)');
    }

    /**
     * TODO
     *
     * To be implemented in the future. Contributions welcome
     *
     * if program.stylus
     *   success("Stylus for CSS")
     * else if program.less
     *   success("Less for CSS")
     * else
     *   success("Plain CSS", "(-s if you prefer Stylus, -l for Less)")
     */

    /* Add the REPL if selected */
    if (program.repl) {
      success('Console Server / REPL');
    }

    log('Next, run the following commands:'.yellow);
    log('   cd ' + name);
    log('   [sudo] npm install');
    log('To start your app:'.yellow);
    log('   node app.js');
  }
};
