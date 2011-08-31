### Scaling using ZeroMQ

Scaling has been a big focus of the 0.2 release. What we have today is by no means the definitive architecture we want to end up with, but we're well on our way to providing you with a number of options when your new real time app takes off and you need to expand over multiple boxes.

So first off, let's just say - scaling is hard. It's dead easy to make a screaming fast single-threaded app (ala SocketStream 0.1) but that's little use once your app surpass the abilities of a single CPU core.

It's not enough to simply use popular Node libraries such as 'cluster' or 'multi-node' as the bottlenecks in SocketStream are not necessarily in the HTTP layer (in fact, as you know, a typical SocketStream does very little serving of HTTP assets. Even if these libraries do improve performance by utilizing multiple cores, what happens when you reach the limitations of the physical hardware? It was clear another approach had to be found which allows scaling over multiple cores and boxes at the same time.

SocketStream 0.2 addresses this problem by breaking up the overall framework into two pieces: the front end which handles all the HTTP traffic, websockets and API requests, and the back end which talks to Redis, MongoDB (or other dbs) and executes the methods in /app/server and /app/shared. If you browse the SocketStream 0.2 code you'll see this clear separation in the /lib directory.

The front end and back end are deliberately only able to communicate with each other via an asynchronous RPC layer which supports multiple transports.

1. In single-process mode message objects are simply exchanged in-memory, without any serialization, for maximum speed

2. In multi-process (cluster) mode messages are serialized using JSON and sent over high-speed ZeroMQ sockets

ZeroMQ was chosen because it's screaming fast and good at dealing with servers joining and leaving the cluster ad hoc.

Because RPC messages are now the only means of communication between the layers this also has the huge added benefit of allowing your databases and Redis to live on a protected subnet, proving an additional layer of security between your data and any malicious requests from external clients.

To enable the following cluster features and commands, you'll need to install ZeroMQ. This should only take a few minutes. Type 'socketstream help' for instructions.

Once ZeroMQ is installed, let's look at each component and see how you can run them individually across multiple machines.

__socketstream frontend__

This command currently spawns a single-threaded process which handles incoming HTTP API and static requests, along with everything relating to Socket.IO. In the near future it will launch additional child processes, most likely using the new child_process.fork() method in Node 0.5.

Right now you are able to run this command on multiple machines but this is not much use at the moment unless you can find an external means to load-balance incoming websocket connections across multiple IPs (sadly most load balancers, including the one in AWS, do not do this) though some have had luck with HAProxy. Rest assured front end scaling solutions will be provided in future releases as we need this badly for some of the projects we're working on.

__socketstream backend__

This command runs a light-weight process manager which in turn forks additional child 'worker' processes to service RPC requests from front end servers. These workers handle all requests to methods living in /app/server, /app/shared and the forthcoming /app/models, as well as processing internal commands such as client heartbeats and disconnects.

Each backend worker process connects directly to Redis and any databases your app may use. Two worker processes are started by default as most servers are (at least) dual core these days - however you may specify the number with the -w option.

Once you have configured the sockets in /app/config.coffee (see below), you may start and stop as many of these back end worker processes as your application needs. Should any worker process (or the entire box) die, the remaining processes will automatically take over. Obviously if your app is very database intensive, or needs to do a lot of processing / calculations, you'll want to start more back end workers to keep response times low.

__socketstream router__

This is the third and final piece of the distributed architecture. This is the one and only process which binds to fixed TCP ports, allowing multiple front end and back end servers to come and go as they please. As the name suggests, it routes/brokers messages between the front end and back end. Because the router is simply passing binary messages from one socket to another it can handle a lot of traffic.

The router also proxies events from Redis so front end servers don't need to (and ideally shouldn't) have any direct connection to Redis. At present only one server can run the router process per cluster. Ideally this machine will have two NICs - allowing it to function as a firewall, protecting your back end servers, Redis and databases from some external attacks.

In the unlikely event the router process crashes it will be automatically restarted by the manager process (run by default when you execute 'socketstream router').

Give these three commands a go now by running each one locally in a separate terminal window. Once you're ready to try running them over multiple boxes you'll need to read the next section.


#### Telling SocketStream how to connect

You may think running your app over multiple servers sounds terribly complicated and must require a lot of manual setup. Thankfully all you need to do is uncomment three lines in /app/config.coffee, replace them with the IP address of the server running 'socketstream router', and ZeroMQ will do the rest.

In more detail:

First work out which server will function as the router and assign this at least one static IP address. If you're going down the recommended route of installing two NICs on this machine (hence allowing the router to act as a firewall), you'll want to assign two static IPs - one for the front end servers to connect to and another for the back ends.

Once you know the IP(s), uncomment the 'cluster' section of your /app/config.coffee file and replace the default IP address with that of the router's. You can assign any port numbers you wish, but it's essential each socket binds on a separate address:port combination.

Next commit your application back to git and ensure every server has the most recent version of your app. Start the router first then your front end and back end servers. SocketStream doesn't know or care how many front end / back end servers you have or what their IP addresses are - only the IP of the router needs to be known and placed in the config file.

We will try to make the cluster configuration procedure even easier / more automatic in future releases.


#### The future

In the future we will continue to work towards eliminating all single points of failure. But right now, if your web app becomes an overnight success, you've got some good options to work with.

If you're feeling very adventurous you could try setting up two or more clusters in different datacentres / availability zones - each with their own router. We haven't tried this ourselves, but in theory there's no reason why it wouldn't work providing both clusters connect to the same instance of Redis. 

Remember, if all of this sounds way too complex for you and scaling is not foremost on your mind at the moment - don't worry. You'll still be able to get great performance out of a single process by running 'socketstream single' (which forces SocketStream to run in a single process) on it's own. This command is the equivalent of running all three server components in one.


#### Contributing

If you're an expert in ZeroMQ and fancy helping us in the scaling department, we'd love to hear from you! Also if you have a passion for tuning and benchmarking - please get in touch. We've made a start here already (run 'socketstream benchmark') but there is much more to come.

