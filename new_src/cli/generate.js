'use strict';

// New App Generator
// -----------------
// Generates skeleton files needed to create a new SocketStream application

require('colors');
var fs    = require('fs');
var path  = require('path');
var util  = require('util');

var dirMode = '0755';


// Private helper functions

function success (name, alternative) {
    console.log(' ✓'.green, name, (alternative || '').grey);
}

function makeRootDirectory (name) {
    try {
        // Create the root directory
        fs.mkdirSync(name, dirMode);
        return true;
    } catch (e) {
        if (e.code === 'EEXIST') {
            console.log('Sorry the \'' + name + '\' directory already exists. Please choose another name for your app.');
            return false;
        } else {
            throw e;
        }
    }
}

exports.generate = function (program) {

    var name        = program.args[1];
    var clientFiles = {css: [], code: []};

    if (name === undefined) {
        return console.log('Please provide a name for your application: $> socketstream new <MyAppName>');
    }

    if (makeRootDirectory(name)) {

        // Force stylus for now
        program.stylus = true;

        var source = path.join(__dirname, '/../../new_project');

        var codeExtension = program.coffee && 'coffee' || 'js';
        var viewExtension = program.jade && 'jade' || 'html';

        var selectedFormatters = [];

        ['coffee', 'jade', 'less', 'stylus'].forEach(function (formatter) {
            if (program[formatter]) { selectedFormatters.push(formatter); }
        });

        // Define tools

        var mkdir = function (dir) {
            return fs.mkdirSync(path.join(name, dir), dirMode);
        };

        var cp = function (src, dest) {
            var destination = path.join(name, (dest || src));
            var read        = fs.createReadStream(path.join(source, src));
            var write       = fs.createWriteStream(destination);
            return util.pump(read, write);
        };

        var write = function (fileName, content) {
            return fs.writeFileSync(path.join(name, fileName), content, 'utf8');
        };


        // Create essential directories
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

        // Copy essential files
        cp('/.gitignore');
        cp('/.nodemonignore');
        cp('/README.md');
        cp('/client/static/favicon.ico');
        cp('/client/code/libs/jquery.min.js');
        cp('/client/code/app/entry.'+codeExtension);
        clientFiles.code.push('libs/jquery.min.js');
        clientFiles.code.push('app');

        // Install chat demo files
        if (program.minimal) {

            cp('/client/views/app.minimal.'+viewExtension, '/client/views/app.'+viewExtension);
            cp('/client/code/app/app.minimal.'+codeExtension, '/client/code/app/app.'+codeExtension);
            cp('/client/css/app.minimal.styl', '/client/css/app.styl');
            cp('/server/rpc/.gitkeep');
            cp('/server/middleware/.gitkeep');
            cp('/client/templates/.gitkeep');
            clientFiles.css.push('app.styl');

        } else {

            cp('/client/static/images/logo.png');
            cp('/client/code/app/app.demo.'+codeExtension, '/client/code/app/app.'+codeExtension);
            cp('/server/middleware/example.'+codeExtension);
            cp('/server/rpc/demo.'+codeExtension);
            cp('/client/css/libs/reset.css');
            cp('/client/css/app.demo.styl', '/client/css/app.styl');
            mkdir('/client/templates/chat');
            cp('/client/templates/chat/message.'+viewExtension);
            cp('/client/views/app.demo.'+viewExtension, '/client/views/app.'+viewExtension);
            clientFiles.css.push('libs/reset.css');
            clientFiles.css.push('app.styl');

        }

        // Generate app.js

        var appjs = [
            '// My SocketStream 0.3 app\n\n',
            'var http = require(\'http\'),\n',
            '    ss = require(\'socketstream\');\n\n',
            '// Define a single-page client called \'main\'\n',
            'ss.client.define(\'main\', {\n',
            '  view: \'app.' + viewExtension + '\',\n',
            '  css:  [\'' + clientFiles.css.join('\', \'') + '\'],\n',
            '  code: [\'' + clientFiles.code.join('\', \'') + '\'],\n',
            '  tmpl: \'*\'\n',
            '});\n\n',
            '// Serve this client on the root URL\n',
            'ss.http.route(\'/\', function (req, res){\n',
            '  res.serveClient(\'main\');\n',
            '});\n\n'
        ];

        // List any selected formatters
        if (selectedFormatters.length > 0) {
            appjs.push('// Code Formatters\n');

            selectedFormatters.forEach(function (name) {
                appjs.push('ss.client.formatters.add(require(\'ss-'+ name + '\'));\n');
            });

            appjs.push('\n');
        }

        appjs.push('// Use server-side compiled Hogan (Mustache) templates. Others engines available\n');
        appjs.push('ss.client.templateEngine.use(require(\'ss-hogan\'));\n');
        appjs.push('// Minimize and pack assets if you type: SS_ENV=production node app.js\n');
        appjs.push('if (ss.env === \'production\') ss.client.packAssets();\n\n');
        appjs.push('// Start web server\n');
        appjs.push('var server = http.Server(ss.http.middleware);\n');
        appjs.push('server.listen(3000);\n');

        // Add the REPL if selected
        if (program.repl) {
            appjs.push('// Start Console Server (REPL)\n');
            appjs.push('// To install client: sudo npm install -g ss-console\n');
            appjs.push('// To connect: ss-console <optional_host_or_port>\n');
            appjs.push('var consoleServer = require(\'ss-console\')(ss);\n');
            appjs.push('consoleServer.listen(5000);\n');
        }

        appjs.push('// Start SocketStream\n');
        appjs.push('ss.start(server)');

        write('/app.js', appjs.join(''));


        // Generate package.json
        var packagejs = [];
        packagejs.push('{\n');
        packagejs.push('  "name": "' + name + '",\n');
        packagejs.push('  "description": "An awesome real time application",\n');
        packagejs.push('  "version": "0.0.1",\n');
        packagejs.push('  "author": "Me <me@mydomain.com>",\n');
        packagejs.push('  "private": true,\n');
        packagejs.push('  "engines": { "node": ">= 0.6.0" },\n');
        packagejs.push('  "dependencies": {\n');
        packagejs.push('    "socketstream": "0.3.x",\n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');
        packagejs.push('  \n');


        var mods = selectedFormatters.concat(['hogan']);
        if (program.repl) { mods.push('console'); }

        mods.forEach(function(name, i) {
            var dependency =  '    "ss-"' + name + '": "0.1.x"';
            // Append a comma unless this is the last dependency in the list
            var end = i === mods.length-1 ? '\n' : ',\n';
            packagejs.push(dependency+end);
        });

        packagejs.push('  },\n');
        packagejs.push('  "scripts":{\n');
        packagejs.push('    "start":"node app.js"\n');
        packagejs.push('  }\n');
        packagejs.push('}');
        
        write('/package.json', packagejs.join(''));

        // Show finish text
        console.log('Success! Created app \'' + name + '\' with:'.yellow);

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

        // To be implemented in the future. Contributions welcome
        // if program.stylus
        //   success("Stylus for CSS")
        // else if program.less
        //   success("Less for CSS")
        // else
        //   success("Plain CSS", "(-s if you prefer Stylus, -l for Less)")

        if (program.repl) {
            success('Console Server / REPL');
        }

        console.log('Next, run the following commands:'.yellow);
        console.log('   cd ' + name);
        console.log('   [sudo] npm install');
        console.log('To start your app:'.yellow);
        console.log('   node app.js');
    }

};