# agate
NodeJS TypeScript scalable back-end and content aggregation template/barebone

## What is it?

Currently in development, Agate is a to-be modern, quickly deployable, isolated and encrypted cloud/aggregation service
based on the previous outdated ES5 version.

Agate will be an extensible, testable ecosystem meant for supervision, administration and archiving of various entry-points.

## Startup
```javascript
async function start() {
    Logger.Tim('startup');
    // load all settings
    let environment = await Environment.loadEnvironment();

    let webServer = new WebServer();

    // mount the web server routes according to current config environment
    let express = await webServer.mount(environment);

    // bind the web server to a port and start listening
    let server = await webServer.startListener(express);

    // launch the socket on already started express instance
    let io = await WebServer.bindSocketServer(server);

    // handle the socket events
    webServer.bindSocketOperator(io);
}

start()
    .then(() => {
        Logger.Std('start sequence', 'Complete');
        Logger.Tie('startup');
    })
    .catch((err) => {
        Logger.Err('start sequence', err);
    });
```

## Project structure

```
environment
  - web_settings.json
  - custom.json
src
  - agate-front
    - src
      - javascript
      - styling
      - templates
    - index.html
    - login.html
  - agate-security
  - agate-utility
  - agate-webserver
  - index
  - plugins
```
#### environment
Directory for configuration files
#### src
This is where all the server code is placed
###### agate-front
Houses the front-end and has a binding class in `lib` directory
###### agate-security
Related to sessions and authentication across the application
###### agate-utility
Place for utility functions to reside in
###### agate-webserver
The main server that also contains classes related to it
#### index
Startup and code related to it is designated to be put here
#### plugins
Externally provided plugins can be put in here(more on that later)
