0.2 preview / 2011-08-10
========================

* /app/server methods can now take multiple arguments, though the HTTP API continues to pass multiple params to the first arg as an object
* Changed error messages you get when passing incorrect arguments (and written specs for this in an external project for now)
* Socket.IO server upgraded to 0.7.8
* Socket.IO client upgraded to 0.7.5 (latest). Minified version included for the first time
* Now loads SS.events (server-side) before /app/server code so you may emit your own custom events
* Now works properly with Subversion (no longer tries to load .svn dirs into the API tree)


0.2 preview / 2011-08-07
========================

Major changes since 0.1. See full announcement here: https://github.com/socketstream/socketstream/blob/0.2/doc/annoucements/0.2.md

All archived history on 0.1 branch
