# Live Reloading of Client Files

Life as a front-end web developer used to be a continuous cycle of 'change file', 'reload browser', 'change file', etc etc until you got the result you were looking for.

SocketStream breaks this cycle by automatically refreshing the browser whenever you make a change to any file in the `client` directory.

This feature is especially useful when tweaking CSS and HTML. Just open up your text editor on one side of the screen, put the browser on the other, and watch your productivity soar.

Live Reload is automatically enabled unless you call:

   ss.client.packAssets()

As you typically would in `production` mode.


Note: Live Reload is built on Node's `fs.watch()` API which can behave differently on different operating systems. If things don't work as expected, please log an issue and be sure to mention which OS you're using.


