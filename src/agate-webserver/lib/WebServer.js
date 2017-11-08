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
const express = require("express");
const http = require("http");
const root = require("app-root-path");
const SocketIo = require("socket.io");
const _ = require("lodash");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const BlueBird = require("bluebird");
const Environment_1 = require("./Environment");
const Plugins_1 = require("./Plugins");
const _1 = require("../../agate-utility/");
const agate_front_1 = require("../../agate-front");
const agate_security_1 = require("../../agate-security");
const _2 = require("../../agate-utility/");
class WebServer {
    constructor() {
        /**
         * Ensures everyone without a valid session won't be accessing
         * the inner system
         */
        this.indexRedirector = (req, res, next) => {
            this.sessionService.doesExist(req.cookies.ox)
                .then((doesExist) => {
                if (!doesExist && req.originalUrl !== '/login')
                    return res.redirect('/login');
                if (doesExist && req.originalUrl === '/login')
                    return res.redirect('/');
                console.log('req1');
                next();
            })
                .catch((err) => {
                _1.Logger.Err('index redirector', err);
            });
        };
        this.express = express();
        this.express.use(cookieParser());
        this.express.use(bodyParser.urlencoded({
            extended: true
        }));
        this.express.use(this.indexRedirector);
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param environment Configuration Ecosystem class instance
     * @returns promise of an express instance
     */
    mount(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            let frontBind = new agate_front_1.FrontBind(this.sessionService);
            let router = frontBind.constructRouter(environment);
            let routes = yield this.getPluginRoutes(environment);
            let controllers = yield this.getPluginControllerConcat(environment);
            _.each(routes, (route) => {
                router.get(route.route, (req, res) => {
                    res.sendFile(`${root}/src/plugins/${route.code}/${route.path}`);
                });
            });
            router.get('/js/plugins.min.js', (req, res) => {
                //let session = sessionOperator.getSession(req);
                let totalConcatScript = '';
                _.each(controllers, (data, controllerIdentifier) => {
                    //if (hasFlag(session, data.meta.flag)) {
                    totalConcatScript += data.raw;
                    //}
                });
                res.send(totalConcatScript);
            });
            _1.Logger.Std('plugins', 'Controllers registered');
            this.express.use('/', router);
            return Promise.resolve(this.express);
        });
    }
    initMemCached(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let MemCached = require('memcached');
                this.memCached = new MemCached(environment.web.memCachedLocations);
                this.memCached = BlueBird.promisifyAll(this.memCached);
                this.sessionService = new agate_security_1.SessionService(this.memCached);
                return resolve(true);
            });
        });
    }
    /**
     * Handles the plugin exceptions and prints specific messages
     * in the console depending on severity
     * @param err Exception
     * @returns an empty object
     */
    static handlePluginExceptions(err) {
        switch (err.code) {
            case _2.ExceptionCodes.NoSuchFileOrDirectory:
                _1.Logger.Std("plugins", "Plugins directory does not exist, skipping");
                return {};
            default:
                _1.Logger.Err("plugins", "Unhandled exception in plugins, halting functionality");
                return {};
        }
    }
    /**
     * Returns routes defined by plugins added to the system
     * @param environment Configuration Ecosystem class instance
     * @returns promise of extracted plugin routes
     */
    getPluginRoutes(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            let plugins;
            try {
                plugins = yield Plugins_1.default.PromisePluginsLoad(environment);
            }
            catch (e) {
                return WebServer.handlePluginExceptions(e);
            }
            return new Promise(function (resolve, reject) {
                let routesToReturn = [];
                if (Object.keys(plugins).length > 0) {
                    _.each(plugins, function (manifest, pluginName) {
                        if (Object.keys(manifest.routes).length > 0) {
                            _.each(manifest.routes, function (route, routePath) {
                                routesToReturn.push({
                                    'route': routePath,
                                    'flag': route.flag,
                                    'universe': manifest.operators !== undefined ? manifest.operators.universe : '',
                                    'plugin': pluginName,
                                    'code': manifest.code,
                                    'path': route.path,
                                    'menu': route.menu,
                                    'icon': route.icon,
                                    'title': route.title
                                });
                            });
                        }
                    });
                    resolve(routesToReturn);
                }
                else {
                    resolve([]);
                }
            });
        });
    }
    /**
     * Adds a special route for JS injections from plugins
     * @param environment Configuration Ecosystem class instance
     * @returns promise of a list of parsed plugin controller injections
     */
    getPluginControllerConcat(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            let plugins;
            try {
                plugins = yield Plugins_1.default.PromisePluginsLoad(environment);
            }
            catch (e) {
                return WebServer.handlePluginExceptions(e);
            }
            return new Promise(function (resolve, reject) {
                let concattedControllers = {};
                if (Object.keys(plugins).length > 0) {
                    _.each(plugins, function (manifest, pluginName) {
                        if (manifest.controller !== undefined && Object.keys(manifest.controller).length > 0) {
                            _.each(manifest.controller, function (controllerMetaData, controllerIdentifier) {
                                let controllerPath = `${root}/src/plugins/${manifest.code}/${controllerMetaData.path}`;
                                let controller = fs.readFileSync(controllerPath);
                                concattedControllers[controllerIdentifier] = {
                                    'meta': controllerMetaData,
                                    'raw': controller
                                };
                            });
                        }
                    });
                    resolve(concattedControllers);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param express Current express instance that will be run
     * @returns promise of a http server with bound listening
     */
    startListener(express) {
        let { port } = Environment_1.default.config.web;
        const mainServer = new http.Server(express);
        mainServer.listen(port, (err) => {
            if (err) {
                return console.log(err);
            }
            return _1.Logger.Std('listener', `Server is listening on ${port}`);
        });
        return Promise.resolve(mainServer);
    }
    /**
     * Mounts a new socket io instance on the
     * http listener instance that will run express
     * @param server Instance of the http listener
     * @returns a new socket io instance
     */
    static bindSocketServer(server) {
        _1.Logger.Std('listener', `Socket has now started`);
        return Promise.resolve(new SocketIo(server));
    }
    socketOn(eventName, flag, socket, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            let session = yield this.sessionService.authSocketRequest(eventName, flag, socket);
            console.error(session);
            if (session !== undefined)
                socket.on(eventName, handler);
        });
    }
    /**
     * Mounts the socket instance to an operator
     * @param io Current express instance that will be run
     * @returns void
     */
    bindSocketOperator(io) {
        let vm = this;
        io.on('connection', function (socket) {
            _1.Logger.Std('socket', `Connection established ID:${socket.id} IP:${socket.handshake.address}`);
            // welcome the client
            socket.emit('welcome', true);
            vm.socketOn('login', '', socket, (args, callback) => {
                console.log(args);
            })
                .catch((err) => {
                _1.Logger.Err('login', err);
                throw err;
            });
        });
    }
}
exports.default = WebServer;
//# sourceMappingURL=WebServer.js.map