### Connecting to Redis

An open connection to Redis is automatically accessible anywhere within your server-side code using the R global variable. E.g.

``` coffee-script
    R.set("string key", "string val")

    R.get("string key", (err, data) -> console.log(data))    # prints 'string val'
```

The Redis host, port and database/keyspace index are all configurable via the `SS.config.redis` params. You may wish to set a different `SS.config.redis.db_index` for your development/staging/production environments to ensure data is kept separate.

All internal SocketStream keys and pub/sub channels are prefixed with 'ss:', so feel free to use anything else in your application.

[View full list of commands](http://redis.io/commands)