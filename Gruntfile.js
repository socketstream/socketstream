/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    var sh = require('shelljs');

    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-ngdocs');

    grunt.initConfig({
        docsSever: {
            port: 9001,
        },
        clean: {
            docs: {
                src: ['docs']
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
        shell: {
            //We use %version% and evluate it at run-time, because <%= pkg.version %>
            //is only evaluated once
            'release-prepare': [
                'grunt is-gh-pages-branch-exist',
                'grunt build:docs',
                'grunt is-clean:master',
                'grunt version',    //remove "-SNAPSHOT" from the project's version in package.json
                'grunt changelog'
            ],
            'release-complete': [
                'git commit CHANGELOG.md package.json -n -m "chore(release): v%version%"',
                'git tag %version%'
            ],
            'release-start': [
                'grunt version:patch:"SNAPSHOT"',
                'git commit package.json -n -m "chore(release): Starting v%version%"'
            ],
            'release-push': [
                'git push origin master',
                'git push origin gh-pages',
                'git push --tags',
            ],
            'update-gh-pages': [
                'git checkout gh-pages',
                'git merge master',
                'git checkout master'
            ]
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                templateFile: 'src/docs/changelog.tpl.md',
                github: 'socketstream/socketstream'
            }
        },
    });

    // Rename our watch task to 'delta', then make actual 'watch'
    grunt.renameTask('watch', 'delta');

    /**
     * Sets version in 'package.json' in http://semver.org friendly mode
     *
     * @param {String} type   Could be 'major', 'minor' or 'patch'
     * @param {String} suffix Suffic string, example: 'alpha', 'pre-alpha', 'beta'
     */
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

    /**
     * Task for setting project version according to http://semver.org
     * @usage
     *     grunt version:type:suffix
     *
     *     // suppose current version in package.json is "0.3.10"
     *
     *     grunt version:patch // will set version to "0.3.11"
     *     grunt version:patch // one more call will increas version to "0.3.12"
     *
     *     grunt version:minor:"alpha" // this one will set up version to "0.4.0-alpha"
     *
     *     grunt version" // this clean up current vesion to valid according to http://semver.org,
     *                    // so "0.3.10-SNAPSHOT" will become "0.3.10"
     */
    grunt.registerTask('version', 'Set version. If no arguments, it just takes off suffix', function() {
        setVersion(this.args[0], this.args[1]);
    });

    grunt.registerTask('enforce', 'Install commit message enforce script if it doesn\'t exist', function() {
        if (!grunt.file.exists('.git/hooks/commit-msg')) {
            grunt.file.copy('misc/validate-commit-msg.js', '.git/hooks/commit-msg');
            require('fs').chmodSync('.git/hooks/commit-msg', '0755');
        }
    });

    /**
     * Check is master(default) or specified branch is clean for commit
     *
     *  grunt:is-clean // checks 'master' branch
     *  grunt:is-clean:test // checks 'test' branch
     *
     * @param {String} Branch name to check
     */
    grunt.registerTask('is-clean', 'Install commit message enforce script if it doesn\'t exist', function() {
        var result,
            branch = this.args[0] ? this.args[0] : 'master';

        result = sh.exec('git symbolic-ref HEAD', {silent: true});
        if (result.output.trim() !== 'refs/heads/' + branch) {
            throw new Error('Not on master branch, aborting! Current branch is \'' + result.output.trim() + '\'');
        }

        result = sh.exec('git status --porcelain', {silent: true});
        if (result.output.trim() !== '') {
            grunt.log.error(result.output.trim());
            throw new Error('Working copy is dirty, aborting!');
        }
    });

    grunt.registerTask('is-gh-pages-branch-exist', 'Check if gh-pages branch exists, if not create it', function() {
        var result,
            branch = this.args[0];

        result = sh.exec('git branch | grep gh-pages', {silent: true});
        if (result.output.trim() ===  '') {
            sh.exec('git branch gh-pages origin/gh-pages' + branch, {silent: true})
        }
    });

    grunt.registerMultiTask('shell', 'run shell commands', function() {
        var self = this;

        self.data.forEach(function(cmd) {
            cmd = cmd.replace('%version%', grunt.file.readJSON('package.json').version);
            grunt.log.ok(cmd);

            var result = sh.exec(cmd, { silent: true });

            if (result.code !== 0) {
                grunt.fatal(result.output);
            }
        });
    });

    grunt.registerTask('default', 'Default task which runs all the required subtasks', []);
    grunt.registerTask('build:docs', 'Build documentation', ['clean:docs', 'ngdocs']);
    grunt.registerTask('watch:docs', 'Watching for changes and re-building docs', ['concurrent:docsSite']);
    grunt.registerTask('update:docs', 'Update gh-page branch by merging from master', ['shell:update-gh-pages']);

    grunt.registerTask('release:start', 'Increase patch version by 1, add suffix "SNAPSHOT" as "major.minor.(patch+1)-SNAPSHOT" and commit package.json', ['shell:release-start']);
    grunt.registerTask('release:prepare', 'Run all the tests, generates CHANGELOG.md since laste release and and clean up version to just "major.minor.patch"', ['shell:release-prepare']);
    grunt.registerTask('release:complete', 'Complete release by committing CHANGELOG.md and package.json and adding version tag', ['shell:release-complete', 'shell:update-gh-pages']);
    grunt.registerTask('release:push', 'Push to origin tags, master and gh-pages branches', ['shell:release-push']);
}
