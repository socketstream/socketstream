/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-ngdocs');

    /*
        Project configuration
        According to https://github.com/gruntjs/grunt-contrib-jshint/pull/24#issuecomment-14976842
        jshint options could not be merged with .jshintrc
        so we need to use

        options: grunt.util._.merge({}, grunt.file.readJSON('.jshintrc')),

        to merge the required options

    */
    grunt.initConfig({
        docsSever: {
            port      : 9001,
        },
        clean: {
            docs: {
                src: ['docs']
            }
        },
        jshint: {
            server: {
                /*
                   TODO add option "devel: true" for production linting

                   This option defines globals that are usually used for
                   logging poor-man's debugging: console, alert, etc.
                   It is usually a good idea to not ship them in production because,
                   for example, console.log breaks in legacy versions of Internet Explorer.

                   http://www.jshint.com/docs/options/#devel
                 */
                options: grunt.util._.merge(
                    grunt.file.readJSON('.jshintrc'),
                    {
                        ignores: [
                            'lib/client/system/libs/*',
                            'lib/client/system/modules/*',
                            'lib/websocket/transports/engineio/*',
                            'test/helpers/connect.js',
                            'test/fixtures/**'
                        ]
                    }
                ),
                files: {
                    src: [
                        'Gruntfile.js',
                        'test/**/*.js',
                        'lib/**/*.js',
                        'lib/websocket/transports/engineio/index.js'
                    ]
                }
            },
            client: {
                options: grunt.util._.merge(
                    grunt.file.readJSON('.jshintrc'),
                    {
                        browser: true,
                        node   : false,
                        ignores: [
                            'lib/client/system/libs/*',
                            'lib/client/system/index.js'
                        ]
                    }
                ),
                files: {
                    src: [
                        'lib/client/system/**/*.js'
                    ]
                }
            },
            test: {
                options: {
                    ignores: ['test/fixtures']
                },
                files: {
                    src: [
                        'test/unit/**/*.js'
                    ]
                }
            }
        },
        ngdocs: {
            options: {
                title: 'SocketStream',
                scripts: [
                    'angular.js',
                ],
                styles: [
                    'src/docs/site/css/main.css'
                ],
                // navTemplate: 'src/docs/site/header.html',
                startPage: 'tutorials',
                titleLink: '#/tutorials',
                discussions: {
                    shortName: 'socketstream',
                    url: 'http://romanminkin.github.io/socketstream/docs/',
                    dev: true
                },
                html5Mode: false,
                bestMatch: true
            },
            tutorials: {
                src: ['src/docs/tutorials/**/*.ngdoc'],
                title: 'Tutorials'
            },
            api: {
                src: ['lib/**/*.js'],
                title: 'API Documentation'
            },
            demos: {
                src: ['src/docs/demos/**/*.ngdoc'],
                title: 'Demos'
            },
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            docsSite: ['delta:docs', 'connect:docsSite']
        },
        delta: {
            docs: {
                options: {
                    interrupt: true,
                    atBegin: true
                },
                files: [
                    'lib/**',
                    'src/**'
                ],
                tasks: ['clean', 'ngdocs']
            }
        },
        connect: {
            options: {
            },
            docsSite: {
                options: {
                    port     : '<%= docsSever.port %>',
                    keepalive: true,
                    base     : 'docs',
                }
            }
        },
        mochaTest: {
            src: [
                'test/unit/**/*.test.js',
            ],
            options: {
                reporter: 'spec'
            }
        },
        shell: {
            //We use %version% and evluate it at run-time, because <%= pkg.version %>
            //is only evaluated once
            'release-prepare': [
                'grunt before-test after-test',
                'grunt version', //remove "-SNAPSHOT"
                'grunt changelog'
            ],
            'release-complete': [
                'git commit CHANGELOG.md package.json -m "chore(release): v%version%"',
                'git tag %version%'
            ],
            'release-start': [
                'grunt version:minor:"SNAPSHOT"',
                'git commit package.json -m "chore(release): Starting v%version%"'
            ],
            'pre-update-gh-pages': [
                'git checkout gh-pages',
                'git merge master'
            ],
            'post-update-gh-pages': [
                'git commit docs -m "Updating docs: v%version%"',
                'git checkout master'
            ]
        },
    });

    // Rename our watch task to 'delta', then make actual 'watch'
    grunt.renameTask('watch', 'delta');

    function setVersion(type, suffix) {
        var file = 'package.json',
            VERSION_REGEX = /([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)(-\w+)*([\'|\"])/,
            contents = grunt.file.read(file),
            version;
        contents = contents.replace(VERSION_REGEX, function(match, left, center) {
            version = center;
            if (type) {
                version = require('semver').inc(version, type);
            }
            //semver.inc strips our suffix if it existed
            if (suffix) {
                version += '-' + suffix;
            }
            return left + version + '"';
        });
        grunt.log.ok('Version set to ' + version.cyan);
        grunt.file.write(file, contents);
        return version;
    }

    grunt.registerTask('version', 'Set version. If no arguments, it just takes off suffix', function() {
        setVersion(this.args[0], this.args[1]);
    });

    grunt.registerMultiTask('shell', 'run shell commands', function() {
        var self = this,
            sh = require('shelljs');
        self.data.forEach(function(cmd) {
            cmd = cmd.replace('%version%', grunt.file.readJSON('package.json').version);
            grunt.log.ok(cmd);
            var result = sh.exec(cmd, {
                silent: true
            });
            if (result.code !== 0) {
                grunt.fatal(result.output);
            }
        });
    });

    grunt.registerTask('default', 'Default task which runs all the required subtasks', ['jshint', 'test']);
    grunt.registerTask('test', 'Test everything', ['mochaTest']);
    grunt.registerTask('build:docs', 'Build documentation', ['clean:docs', 'ngdocs']);
    grunt.registerTask('watch:docs', 'Watching for changes and re-building docs', ['concurrent:docsSite']);
    grunt.registerTask('update:docs', 'Update gh-page branch from master', ['clean:docs', 'shell:pre-update-gh-pages', 'build:docs', 'shell:post-update-gh-pages']);
}