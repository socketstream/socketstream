Install Instructions
====================

SocketStream runs on all UNIX based platforms, including OS X and Linux.

### Mac OS X installation (tested on Snow Leopard 10.6.7)

    # install XCode, required for compiling software
    
    http://itunes.apple.com/gb/app/xcode/id422352214?mt=12
    
    # install Redis
    
    download the latest version from http://redis.io
    
    tar -xvzf redis-2.2.X.tar.gz
    cd redis-2.2.X
    make
    make test # this is optional, but they recommend it
    sudo make install
    
    to run in the foreground (and see incoming connections):
      redis-server
  
    to run in the background:
      env redis-server > /tmp/redis.log 2>&1 &

    # install Node.js
    
    Download latest stable (0.4.x) version from http://nodejs.org/#download

    E.g. for Node 0.4.9

    tar zxvf node-v0.4.9.tar.gz
    cd node-v0.4.9
    ./configure
    make # this will take a couple of minutes
    sudo make install
    
    # install npm
    
    curl http://npmjs.org/install.sh | sudo sh
  
    # install SocketStream
    
    sudo npm install socketstream -g
    
    # create a Socketstream app as a test
    
    socketstream new test
    cd test
    socketstream start
    

### Ubuntu 10.04 server installation

Here is an example that shows how to install SocketStream and it's dependencies on Ubuntu Server, including building Redis and Node.js from source:

    # install prerequisites
    sudo apt-get install build-essential automake git-core curl libssl-dev -y
    
    # install and run redis
    cd ~
    wget http://redis.googlecode.com/files/redis-2.2.4.tar.gz
    tar -xvzf redis-2.2.4.tar.gz
    cd redis-2.2.4
    make
    sudo make install
    env redis-server > /tmp/redis.log 2>&1 &

    # install Node.js
    
    Download latest stable (0.4.x) version from http://nodejs.org/#download

    E.g. for Node 0.4.9

    tar zxvf node-v0.4.9.tar.gz
    cd node-v0.4.9
    ./configure
    make # this will take a couple of minutes
    sudo make install

    # install npm
    curl http://npmjs.org/install.sh | sudo sh
    
    # install SocketStream
    sudo npm install socketstream -g
    
    # create a new socketstream project called 'test'
    cd ~
    socketstream new test
    
    # run test app
    cd test
    socketstream start
    
    
    
