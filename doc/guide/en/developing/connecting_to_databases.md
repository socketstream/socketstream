### Connecting to Databases

Building a great DB connection framework is very much a focus for a future releases, but this is how we're connecting to mongoDB today:

The /config/db.coffee (or .js) file is loaded automatically at startup (if present). So you can do something like this:

``` coffee-script
mongodb = require('mongodb')   # installed by NPM
Db = mongodb.Db
Connection = mongodb.Connection
Server = mongodb.Server
global.M = new Db('my_database_name', new Server('localhost', 27017))
M.open (err, client) -> console.error(err) if err?
```
This would allow you to access mongoDB from the M global variable.

As this file is loaded after the environment config is processed, you can put your db connection params in /config/environments/development.coffee

``` coffee-script
exports.config =
  db:
    mongo:
      database:     "my_database_name"
      host:         "localhost"
      port:         27017
```

Then access them inside /config/db.coffee as so:

``` coffee-script
config = SS.config.db.mongo
global.M = new Db(config.database, new Server(config.host, config.port))
```

We've not tested SocketStream with CouchDB, MySQL, or any other DB, but we know others are using these databases successfully with SocketStream by following the same principals above.
