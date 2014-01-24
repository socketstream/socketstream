## Sources
If you have questions about how to use SocketStream, here is a useful sources:

1. [SocketStream.org](socketstream.org)
2. [Google Group](https://groups.google.com/d/forum/socketstream)
3. [GitHub](https://github.com/socketstream/socketstream)
4. IRC channel [#socketstream](http://webchat.freenode.net/?channels=socketstream)
5. Twitter [@socketstream](http://twitter.com/#!/socketstream)

## Submitting issues
To submit an issue please use [SocketStream issue tracker](https://github.com/socketstream/socketstream/issues).

## Contributing to Source Code
We would love for you to contribute to SocketStream source code it even better.
To disscuss Minor or Major changes please use [Google Group](https://groups.google.com/d/forum/socketstream) or [SocketStream issue tracker](https://github.com/socketstream/socketstream/issues)

### Installation Dependencies
Before you can contribute to SocketStream, you need to install or configure the following dependencies on your machine:

* Git - control version system ([GitHub istalling guide](http://help.github.com/mac-git-installation))
* [Node.js](http://nodejs.org/), usually we use latest version of Node.js, but it's alwas better to check the current version in the [package.json](https://github.com/socketstream/socketstream/blob/master/package.json).

### Working with source code

* [Fork](http://help.github.com/forking) the main [SocketStream repository](https://github.com/socketstream/socketstream.git)

* Clone your (forked) Github repository:
```
git clone git@github.com:<github username>/socketstream.git
```

* Go to project repository
```
cd socketstream
```

* Add the main SocketStream repository as an upstream remote to your repository
```
 git remote add upstream https://github.com/socketstream/socketstream.git
```

* Install ```npm``` dependencies
```
npm install
```

* Make some code changes and run Grunt tasks to make sure your code passed required tests:
```
grunt
```

* You can also run specific tasks separately, to see all available tasks run:
```
grunt --help
...
Available tasks
        jshint  Validate files with JSHint. *
     mochaTest  Run node unit tests with Mocha *
       default  Default task which runs all the required subtasks
          test  Test everything
```

### Submitting Your Changes

* Create and checkout a new branch off the master branch for your changes:
```
git checkout -b new-stuff-branch master
```

* Make sure your changes passed the tests:
```
grunt
```

* Commit your changes with descriptive commit message, please describe what you have done as detailed as possible
```
git add -A
git commit
```

* Push your branch to Github:
```
git push origin new-stuff-branch
```

* Create a [pull request](https://help.github.com/articles/creating-a-pull-request)

* Once your patch is reviewed and merged, please delete your branch and pull yours and master changes from the main (upstream - [SocketStream](https://github.com/socketstream/socketstream.git)) repository:
```
git push origin :new-stuff-branch
git checkout master
git branch -D new-stuff-branch
git pull --ff upstream master
```

## Git Commit Guidelines

These rules are adopted from the [AngularJS commit conventions][commit-message-format].

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the SocketStream change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Examples:
```
feat(http): add `connect.compress()` middleware to the stack
```
```
docs(docs): typo fix
```
```
feat(websockets): add transport `engineio`

More efficient engine.io replced socket.io
```
```
fix(http): use blue ink instead of red ink

BREAKING CHANGE: `http` now uses blue ink instead of red.

To migrate, change your code from the following:

`http.start('blue')`

To:

`http.start('red')`
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Type
Is recommended to be one of these (only **feat** and **fix** show up in the `CHANGELOG.md`):

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `cli`,
`http`, `publish`, `session`, `websocket`, `request` etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.


A detailed explanation can be found in this [AngularJS commit conventions document][commit-message-format].

## Documentation generation

We use [ngdocs][ngdocs] module for generating documentation files.

We have two type of documentation:

* **API** - takes from directly from source code from comments to functions and objects defenition
* **Tutorials** - markdown files, located within `src/docs` and have `*.ngdoc` extension

To build/re-build documentation run:
```
    grunt build:docs
```

To runt documentation web site locally the way process will watch for changes and re-building docs on the fly run:
```
    grunt watch:docs
```

To update local `gh-page` branch by mergin from `master` run:
```
    grunt update:docs
```

## Release
#### This guide is only for developers who allowed to perform releases

There are helpful `grunt` tasks for overall version releasing process:

1. First of all we need put a mark into **GIT History Tree** by increasing patch version by **1**, adding suffix "**SNAPSHOT**" (ex. "**0.3.15-SNAPSHOT**") and commiting `package.json`:
```
    grunt release:start
```

2. Then we can perform regular commits with changes and pull requests

3. Once we decide to release a new version we need to **prepeare release** and run all the tests, generate `CHANGELOG.md` since the release start point (**mark commit from step 1**) and clean up version to just "**0.3.15**":
```
grunt release:prepare
```

4. If previouse step passed we need to **complete release** by commiting `CHANGELOG.md`, `package.json` and adding version tag:
```
grunt release:complete
```

5. Finnaly if all good, just push `tags` and both `master` and `gh-pages` branches to `origin`:
```
grunt release:push
```


You are all set! Thank you for your contribution!

[ngdocs]: https://github.com/idanush/ngdocs/wiki/API-Docs-Syntax
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#