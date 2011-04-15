Here is an example that shows how to install socketstream and it's dependencies. Since project is highly experimental it relies on not yet packaged releases of:

* redis
* node.js

### Ubuntu 10.04 server installation

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
    curl http://npmjs.org/install.sh | sh
    
    # build socketstream
    cd ~
    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    npm link
    
    # test socketstream
    cd ~
    socketstream new test
    
    # run test app
    cd test
    sudo env PATH=$PATH socketstream start
