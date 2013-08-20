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

You are all set! Thank you for your contribution!
