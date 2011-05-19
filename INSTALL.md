Install Instructions
====================

SocketStream runs on all UNIX based platforms, including OS X and Linux.

TODO: Provide Mac OS X installation instructions


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
    
    # build socketstream
    cd ~
    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    sudo npm link
    
    # create a new socketstream project called 'test'
    cd ~
    socketstream new test
    
    # run test app
    cd test
    socketstream start
