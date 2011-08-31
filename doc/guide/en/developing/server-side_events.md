### Server-side Events

SocketStream 0.2 allows you to run your own custom server-side code when a client initializes, sends a regular heartbeat, or disconnects - with more events becoming available in the future. This is particularly useful if you need to clean up the database when a client departs.

The best way to get started, and to see the most up-to-date list of possible SS.events, is to generate a new project and look at /config/events.coffee (which of course you're welcome to convert to events.js). All possible server-side events are listed here - commented out until you wish to use them.

All custom server-side events are automatically load balanced across available back end servers, allowing you to simply add additional servers to the cluster as traffic increases.

Note: Even though your app may receive a `client:disconnect` event, it doesn't mean the user has logged out. They may still be connected via another client (potentially via another front end server). This is huge problem that still needs to be resolved by good design - mostly at the application level.

