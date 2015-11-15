## Sources
If you have questions about how to use SocketStream, here are some useful sources:

1. [SocketStream.org](socketstream.org)
2. [GitHub](https://github.com/socketstream/socketstream)
3. Chat [Gitter](https://gitter.im/socketstream/socketstream)
4. Twitter [@socketstream](http://twitter.com/#!/socketstream)

## Submitting issues
To submit an issue please use [SocketStream issue tracker](https://github.com/socketstream/socketstream/issues).

## Contributing to Source Code
We would love for you to contribute to SocketStream to make it even better.
To discuss changes please use the [SocketStream issue tracker](https://github.com/socketstream/socketstream/issues)

### Installation Dependencies
Before you can contribute to SocketStream, you'll need to install or configure the following dependencies on your machine:

* Git - control version system ([GitHub installing guide](http://help.github.com/mac-git-installation))
* [Node.js](http://nodejs.org/), usually we use the latest version of Node.js, but it's always better to check the current version in the [package.json](https://github.com/socketstream/socketstream/blob/master/package.json).

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

* Make some code changes and run the tests to make sure your code passed required tests:
```
npm test
```

### Submitting Your Changes

* Create and checkout a new branch off the master branch for your changes:
```
git checkout -b new-stuff-branch master
```

* Make sure your changes passed the tests:
```
npm test
npm run cover-test
```

* Commit your changes with a descriptive commit message, please describe what you have done as detailed as possible
```
git add -A
git commit
```

* Push your branch to Github:
```
git push origin new-stuff-branch
```

* Create a [pull request](https://help.github.com/articles/creating-a-pull-request)

* Once your patch is reviewed and merged, please delete your branch and pull both yours and master's changes from the main (upstream - [SocketStream](https://github.com/socketstream/socketstream.git)) repository:
```
git push origin :new-stuff-branch
git checkout master
git branch -D new-stuff-branch
git pull --ff upstream master
```

## Git Commit Guidelines

These rules are adopted from the [AngularJS commit conventions][commit-message-format].

Git commit messages will need to be formatted in a certain format.  This is so
that we can generate a changelog from the git commit messages.

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
The scope could be anything specifying the place of the commit change. For example `cli`,
`http`, `publish`, `session`, `websocket`, `request` etc...

### Subject
The subject contains a succinct description of the change:

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

## Code conventions

The codebase was converted from CoffeeScript, so there are certain notations that are a result of that and not
a convention for the project. Use your best judgement when writing code and make it as readable as possible.
Consistency with existing codebase is one of the best ways to make the code easier to understand, so you should
take care not to diverge without a very good reason.

1. Wherever possible functions should be declared in the classic way and not as variables.

2. Variables should be declared where they are used and not at the top of the module except for module wide variables and imports.

These guidelines should not be seen as religion, but rather as a default, and should in effect be seen in 90+% of the codebase.
If you are finding yourself sticking to them only occasionally, you are doing something wrong.


## Documentation generation

We use [ngdocs][ngdocs] module for generating documentation files.

We have two type of documentation:

* **API** - takes from directly from source code from comments to functions and objects defenition
* **Tutorials** - markdown files, located within `src/docs` and have `*.ngdoc` extension

To build/re-build documentation run:
```
    grunt build:docs
```

To run documentation web site locally the way process will watch for changes and re-building docs on the fly run:
```
    grunt watch:docs
```

To update local `gh-page` branch by merging from `master` run:
```
    grunt update:docs
```

## Release
#### This guide is only for developers who perform releases

There are helpful `grunt` tasks for overall version releasing process:

1. Update package.json version

2. Update the CHANGELOG.md and update docs
```
npm run changelog
grunt build:docs
git add .
```

3. Commit changes (was grunt release:complete)
```
git commit -m"0.5.1 release"
git tag 0.5.1
git co gh-pages
git merge develop
git co develop
git push && git push --tags
```


You are all set! Thank you for your contribution!

[ngdocs]: https://github.com/idanush/ngdocs/wiki/API-Docs-Syntax
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
