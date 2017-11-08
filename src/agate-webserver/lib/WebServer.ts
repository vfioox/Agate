import * as express from 'express';
import * as http from 'http';
import * as root from 'app-root-path';
import * as SocketIo from 'socket.io';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as sio from 'socket.io.d';
import * as BlueBird from 'bluebird';
import ConfigEcosystem from './interface/ConfigEcosystem';
import Environment from './Environment';
import Plugins from './Plugins';
import {Application} from 'express3';
import {Logger} from '../../agate-utility/';
import {FrontBind} from '../../agate-front';
import {SessionService} from '../../agate-security';
import {Exception, ExceptionCodes} from "../../agate-utility/";

class WebServer {
    public express: Application;
    public sessionService: SessionService;
    public plugins;
    public memCached;

    /**
     * Ensures everyone without a valid session won't be accessing
     * the inner system
     */
    private indexRedirector = (req, res, next) => {
        this.sessionService.doesExist(req.cookies.ox)
            .then((doesExist) => {
                if (!doesExist && req.originalUrl !== '/login') return res.redirect('/login');
                if (doesExist && req.originalUrl === '/login') return res.redirect('/');
                console.log('req1');
                next();
            })
            .catch((err) => {
                Logger.Err('index redirector', err);
            });
    };

    constructor() {
        this.express = express();
        this.express.use(cookieParser());
        this.express.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));


        this.express.use(this.indexRedirector);
    }

    /**
     * Mounts according route rules as specified in configuration
     * @param environment Configuration Ecosystem class instance
     * @returns promise of an express instance
     */
    public async mount(environment: ConfigEcosystem): Promise<express> {
        let frontBind = new FrontBind(this.sessionService);

        let router = frontBind.constructRouter(environment);
        let routes = await this.getPluginRoutes(environment);
        let controllers = await this.getPluginControllerConcat(environment);

        _.each(routes, (route) => {
            (<express.Router> router).get(route.route, (req, res) => {
                res.sendFile(`${root}/src/plugins/${route.code}/${route.path}`);
            });
        });

        (<express.Router> router).get('/js/plugins.min.js', (req, res) => {
            //let session = sessionOperator.getSession(req);
            let totalConcatScript = '';
            _.each(controllers, (data, controllerIdentifier) => {
                //if (hasFlag(session, data.meta.flag)) {
                totalConcatScript += data.raw;
                //}
            });
            res.send(totalConcatScript);
        });

        Logger.Std('plugins', 'Controllers registered');

        this.express.use('/', router);
        return Promise.resolve(this.express);
    }

    public async initMemCached(environment: ConfigEcosystem): Promise<any> {
        return new Promise((resolve, reject) => {
            let MemCached = require('memcached');
            this.memCached = new MemCached(environment.web.memCachedLocations);

            this.memCached = BlueBird.promisifyAll(this.memCached);

            this.sessionService = new SessionService(this.memCached);
            return resolve(true);
        });
    }

    /**
     * Handles the plugin exceptions and prints specific messages
     * in the console depending on severity
     * @param err Exception
     * @returns an empty object
     */
    public static handlePluginExceptions(err: Exception): object {
        switch (err.code) {
            case ExceptionCodes.NoSuchFileOrDirectory:
                Logger.Std("plugins", "Plugins directory does not exist, skipping");
                return {};
            default:
                Logger.Err("plugins", "Unhandled exception in plugins, halting functionality");
                return {};
        }
    }

    /**
     * Returns routes defined by plugins added to the system
     * @param environment Configuration Ecosystem class instance
     * @returns promise of extracted plugin routes
     */
    public async getPluginRoutes(environment: ConfigEcosystem): Promise<object> {
        let plugins;
        try {
            plugins = await Plugins.PromisePluginsLoad(environment);
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
            } else {
                resolve([]);
            }
        });
    }

    /**
     * Adds a special route for JS injections from plugins
     * @param environment Configuration Ecosystem class instance
     * @returns promise of a list of parsed plugin controller injections
     */
    public async getPluginControllerConcat(environment: ConfigEcosystem): Promise<object> {
        let plugins;
        try {
            plugins = await Plugins.PromisePluginsLoad(environment);
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
            } else {
                resolve(null);
            }
        });
    }

    /**
     * Mounts according route rules as specified in configuration
     * @param express Current express instance that will be run
     * @returns promise of a http server with bound listening
     */
    public startListener(express: express): Promise<http.Server> {
        let {port} = Environment.config.web;
        const mainServer = new http.Server(express);

        mainServer.listen(port, (err) => {
            if (err) {
                return console.log(err);
            }

            return Logger.Std('listener', `Server is listening on ${port}`);
        });

        return Promise.resolve(mainServer);
    }

    /**
     * Mounts a new socket io instance on the
     * http listener instance that will run express
     * @param server Instance of the http listener
     * @returns a new socket io instance
     */
    public static bindSocketServer(server: http.Server): Promise<SocketIo> {
        Logger.Std('listener', `Socket has now started`);
        return Promise.resolve(new SocketIo(server));
    }

    public async socketOn(eventName: string, flag: string, socket: sio.Socket, handler: Function): Promise<void> {
        let session = await this.sessionService.authSocketRequest(eventName, flag, socket);
        console.error(session);
        if (session !== undefined) socket.on(eventName, handler);
    }

    /**
     * Mounts the socket instance to an operator
     * @param io Current express instance that will be run
     * @returns void
     */
    public bindSocketOperator(io: SocketIo): void {
        let vm = this;
        io.on('connection', function (socket: sio.Socket) {
            Logger.Std('socket', `Connection established ID:${socket.id} IP:${socket.handshake.address}`);
            // welcome the client
            socket.emit('welcome', true);

            vm.socketOn('login', '', socket, (args, callback) => {
                console.log(args);
            })
                .catch((err) => {
                    Logger.Err('login', err);
                    throw err;
                });
        });
    }
}

export default WebServer;
