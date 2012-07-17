# Live Reloading of Client Files

Life as a front-end web developer used to be a continuous cycle of 'change file', 'reload browser', 'change file', etc etc until you got the result you were looking for.

SocketStream breaks this cycle by automatically refreshing the browser whenever you make a change to any file in the `/client` directory. What's more, if you're just tweaking the stylesheets, the CSS will be reloaded in place so your app doesn't lose state.

**Tip**: Open up your text editor on one side of the screen, put the browser on the other, and watch your productivity soar!


Live Reload is automatically enabled unless you call:

   ss.client.packAssets()

As you typically would in `production` mode.


### Known issues

#### VIM

VIM creates a temporary file before replacing the real file. To prevent problems with Live Reload, change the write mode with:

    :set nowritebackup


#### Too many files

Live Reload is built on Node's `fs.watch()` API which works differently on each operating system. For example, on Linux you'll get an `EMFILE` error if you have many files in your `client` directory. Change this limit with:

    sudo vi /etc/sysctl.conf 

add the following line 

    fs.inotify.max_user_instances = 200 # or higher if needed 

then run 
    
    sudo sysctl -p

If things still don't work as expected, please log an issue and be sure to mention which OS you're using.


### Options

To disable Live Reload, even in development mode, put the following in your `app.js` code:

    ss.client.set({liveReload: false})

Alternatively, you may specify the top-level directories within `/client` you wish Live Reload to observe. E.g.:

    ss.client.set({liveReload: ['views', 'css'])