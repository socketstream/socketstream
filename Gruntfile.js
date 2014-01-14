/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
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
            port      : 9000,
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
                navTemplate: 'src/docs/header.html',
                html5Mode: false,
                bestMatch: false
            },
            tutorials: {
                src: ['src/**/*.ngdoc'],
                title: 'Tutorials'
            },
            api: {
                src: ['src/**/*.js'],
                title: 'API Documentation'
            },
        },
        watch: {
            docs: {
                files: ['docs'],
                options: {
                    // livereload: '<%= docsSever.livereload %>',
                    livereload: true,
                    interrupt: true,
                    debounceDelay: 1000,
                }
            },
            docsSrc: {
                options: {
                    atBegin: true
                },
                files: [
                    'src/docs/**'
                ],
                tasks: ['clean', 'ngdocs']
            }
        },
        connect: {
            options: {
            },
            docsSite: {
                options: {
                    port      : '<%= docsSever.port %>',
                    keepalive : true,
                    base      : 'docs',
                    // livereload: '<%= docsSever.livereload %>',
                    livereload: true,
                    middleware: function(connect, options) {
                        var middlewares = [],
                            directory;

                        middlewares.push(require('connect-livereload')());

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        directory = options.directory || options.base[options.base.length - 1];
                        options.base.forEach(function(base) {
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });
                        // Make directory browse-able.
                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    }
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
        }
    });

    grunt.registerTask('default', 'Default task which runs all the required subtasks', ['jshint', 'test']);
    grunt.registerTask('test', 'Test everything', ['mochaTest']);
    grunt.registerTask('build:docs', 'Build documentation', ['clean', 'ngdocs', 'connect', 'watch:docs']);
}