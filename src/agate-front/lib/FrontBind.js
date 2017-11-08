"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const root = require("app-root-path");
const _ = require("lodash");
const random = require("randomstring");
const SessionService_1 = require("../../agate-security/lib/SessionService");
class FrontBind {
    /**
     * Bridge between the backend and frontend
     * @constructor
     */
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    /**
     * Mounts according route rules as specified in configuration (styling)
     * @param router Express Router
     * @param environment Configuration Ecosystem class instance
     * @returns Express Router with bound rules
     */
    static registerStyles(router, environment) {
        _.each(environment.web.front.styles, function (props, styleId) {
            router.get(props.route, (req, res) => {
                return res.sendFile(root + environment.web.front.path + props.file);
            });
        });
        return router;
    }
    /**
     * Mounts according route rules as specified in configuration (javascript)
     * @param router Express Router
     * @param environment Configuration Ecosystem class instance
     * @returns Express Router with bound rules
     */
    static registerJs(router, environment) {
        // for our application code
        router.get(environment.web.front.js.app.route, (req, res) => {
            return res.sendFile(root + environment.web.front.path + environment.web.front.js.app.file);
        });
        // for third-party code
        router.get(environment.web.front.js.lib.route, (req, res) => {
            return res.sendFile(root + environment.web.front.path + environment.web.front.js.lib.file);
        });
        return router;
    }
    /**
     * Mounts according route rules as specified in configuration (templates)
     * @param router Express Router
     * @param environment Configuration Ecosystem class instance
     * @returns Express Router with bound rules
     */
    static registerTemplates(router, environment) {
        _.each(environment.web.front.routes, function (props, routeUrl) {
            router.get(routeUrl, (req, res) => {
                return res.sendFile(root + environment.web.front.path + `/src/${routeUrl}.html`);
            });
        });
        return router;
    }
    /**
     * Returns a stripped router for a fresh installation without front-end
     * @returns Express Router with bound rules
     */
    DummyRouter(environment) {
        let router = express.Router();
        let bodyParser = require('body-parser');
        router.use(require('cookie-parser')());
        // to support URL-encoded bodies (form data)
        router.use(bodyParser.urlencoded({
            extended: true
        }));
        router.get("/", (req, res) => {
            return res.sendFile(root + "/src/agate-front/default/fresh.html");
        });
        router.get("/login", (req, res) => {
            let ox = random.generate(20);
            if (req.cookies.ox === undefined) {
                const settings = {
                    maxAge: SessionService_1.default.getSessionLength() * 1000,
                    httpOnly: true
                };
                res.cookie('ox', ox, settings);
            }
            return res.sendFile(root + "/src/agate-front/default/login.html");
        });
        router.post("/default/login", (req, res) => {
            console.log('req');
            let { login, password } = req.body;
            if (login === environment.web.defaultMaster.login
                && password === environment.web.defaultMaster.password) {
                this.sessionService.newSession(req.cookies.ox, login, req.connection.remoteAddress);
                res.send('ok');
            }
        });
        return router;
    }
    /**
     * Creates a new Express Router instance
     * @param environment Configuration Ecosystem class instance
     * @returns Express router with bound rules
     */
    constructRouter(environment) {
        if (environment.web.front === undefined) {
            return this.DummyRouter(environment);
        }
        let router = express.Router();
        // register the index page
        router.get(environment.web.front.index.route, (req, res) => {
            return res.sendFile(root + environment.web.front.path + environment.web.front.index.file);
        });
        // register the login page
        router.get(environment.web.front.login.route, (req, res) => {
            return res.sendFile(root + environment.web.front.path + environment.web.front.login.file);
        });
        router = FrontBind.registerStyles(router, environment);
        router = FrontBind.registerJs(router, environment);
        router = FrontBind.registerTemplates(router, environment);
        return router;
    }
}
exports.default = FrontBind;
//# sourceMappingURL=FrontBind.js.map