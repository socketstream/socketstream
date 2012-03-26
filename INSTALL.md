Install Instructions
====================

SocketStream runs well on UNIX based platforms (including OS X and Linux) and Windows.

Note: These instructions will be changed once the first 0.3 package is published to npm.


### Mac OS X installation (tested on OS X Lion)

    # install XCode, required for compiling software
    
    http://itunes.apple.com/gb/app/xcode/id422352214?mt=12
    
    # install Node.js
    
    Download latest stable (0.6.x) version from http://nodejs.org/#download
  
    # install SocketStream (latest from Github master)
    
    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    npm link
    
    # create a Socketstream app called 'test'
    
    socketstream new test
    cd test
    npm install
    npm link socketstream
    node app.js
    

### Ubuntu 10.04 server installation

Here is an example that shows how to install SocketStream and it's dependencies on Ubuntu Server, including building Node.js from source:

    # install prerequisites
    sudo apt-get install build-essential automake git-core curl libssl-dev -y

    # install Node.js
    
    Download latest stable (0.6.x) version from http://nodejs.org/#download

    E.g. for Node 0.6.7

    tar zxvf node-v0.6.7.tar.gz
    cd node-v0.6.7
    ./configure
    make # this will take a couple of minutes
    sudo make install

    # install SocketStream (latest from Github master)
    
    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    npm link
    
    # create a Socketstream app called 'test'
    
    socketstream new test
    cd test
    npm install
    npm link socketstream
    node app.js
    

### Windows

    # install SocketStream (latest from Github master)

    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    npm install
    cd ..

    # create a Socketstream app called 'test'

    node socketstream\bin\socketstream new test
    cd test
    npm install
    npm install ..\socketstream    
