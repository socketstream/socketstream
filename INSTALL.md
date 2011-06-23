Install Instructions
====================

SocketStream runs on all UNIX based platforms, including OS X and Linux.

### Mac OS X installation (tested on Snow Leopard 10.6.7)

    # get XCode, required for compiling software
    
    http://itunes.apple.com/gb/app/xcode/id422352214?mt=12
    
    # get Redis
    
    wget http://redis.googlecode.com/files/redis-2.2.10.tar.gz  # visit http://redis.io for the latest stable version
    tar -xvzf redis-2.2.10.tar.gz
    cd redis-2.2.4
    make
    make test # this is optional, but they recommend it
    sudo make install
    env redis-server > /tmp/redis.log 2>&1 & # make redis run in the background
    
    # get Node.js
    
    git clone --depth 1 https://github.com/joyent/node.git
    cd node
    git checkout origin/v0.4
    export JOBS=2 # optional, sets number of parallel commands.
    mkdir ~/local
    ./configure --prefix=$HOME/local/node
    make # this will take a couple of minutes
    make install
    echo 'export PATH=$HOME/local/node/bin:$PATH' >> ~/.profile
    source ~/.profile
  
    # get npm
    
    curl http://npmjs.org/install.sh | sh
  
    # get SocketStream
    
    sudo npm install -g socketstream
    
    # create a Socketstream app as a test
    
    socketstream new test
    cd test
    socketstream start
    

### Ubuntu 10.04 server installation

Here is an example that shows how to install SocketStream and it's dependencies on Ubuntu Server, including building Redis and Node.js from source:

    # get prerequisites
    sudo apt-get install build-essential automake git-core curl libssl-dev -y
    
    # install and run redis
    cd ~
    wget http://redis.googlecode.com/files/redis-2.2.4.tar.gz
    tar -xvzf redis-2.2.4.tar.gz
    cd redis-2.2.4
    make
    sudo make install
    env redis-server > /tmp/redis.log 2>&1 &
    
    # install node.js
    cd ~
    git clone https://github.com/joyent/node.git
    cd node
    export JOBS=2
    mkdir -p ~/local/node
    ./configure --prefix=$HOME/local/node
    make
    make install
    export PATH=$HOME/local/node/bin:$PATH
    
    # install npm
    curl http://npmjs.org/install.sh | sudo sh
    
    # get SocketStream
    sudo npm install -g socketstream
    
    # create a new socketstream project called 'test'
    cd ~
    socketstream new test
    
    # run test app
    cd test
    socketstream start
    
    
    
