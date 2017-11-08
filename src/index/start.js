"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const agate_webserver_1 = require("../agate-webserver");
const agate_utility_1 = require("../agate-utility");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        agate_utility_1.Logger.Tim('startup');
        // load all settings
        let environment = yield agate_webserver_1.Environment.loadEnvironment();
        let webServer = new agate_webserver_1.WebServer();
        let memCachedStatus = yield webServer.initMemCached(environment);
        // mount the web server routes according to current config environment
        let express = yield webServer.mount(environment);
        // bind the web server to a port and start listening
        let server = yield webServer.startListener(express);
        // launch the socket on already started express instance
        let io = yield agate_webserver_1.WebServer.bindSocketServer(server);
        // handle the socket events
        webServer.bindSocketOperator(io);
    });
}
start()
    .then(() => {
    agate_utility_1.Logger.Std('start sequence', 'Complete');
    agate_utility_1.Logger.Tie('startup');
})
    .catch((err) => {
    agate_utility_1.Logger.Err('start sequence', err);
});
//# sourceMappingURL=start.js.map