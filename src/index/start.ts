import {Environment, WebServer} from '../agate-webserver';
import {Logger} from '../agate-utility';

async function start() {
    Logger.Tim('startup');
    // load all settings
    let environment = await Environment.loadEnvironment();

    let webServer = new WebServer();

    let memCachedStatus = await webServer.initMemCached(environment);

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
