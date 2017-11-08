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
const cookie = require("cookie");
const agate_utility_1 = require("../../agate-utility");
const SESSION_LENGTH = 60 * 60 * 24 * 2;
class SessionService {
    /**
     * Sessioning service
     * @constructor
     */
    constructor(memCached) {
        this.memCached = memCached;
    }
    /**
     * Generates a unix epoch timestamp
     * @returns unix epoch
     */
    static getTime() {
        return Math.round(new Date().getTime() / 1000);
    }
    /**
     * Returns session length constant
     * @returns session length
     */
    static getSessionLength() {
        return SESSION_LENGTH;
    }
    /**
     * Initializes a new session
     * @returns void
     */
    newSession(ox, username, ip, master) {
        let session = {};
        session.start = SessionService.getTime();
        session.ip = ip;
        session.username = username;
        if (master !== undefined) {
            if (master.users[username] !== undefined) {
                session.config = master.users[username];
            }
        }
        this.memCached.setAsync(ox, session, SessionService.getSessionLength())
            .then((status) => {
            agate_utility_1.Logger.Std('new session', ox, status);
        })
            .catch((err) => {
            agate_utility_1.Logger.Err('new session', ox, err);
        });
    }
    doesExist(ox) {
        return __awaiter(this, void 0, void 0, function* () {
            let getData = yield this.memCached.getAsync(ox);
            return Promise.resolve(ox !== undefined && getData !== undefined);
        });
    }
    /**
     * Authorizes an express request
     * @param req Request object from express
     * @returns {Promise} a promise of the session
     */
    authExpressRequest(req) {
        return new Promise((resolve, reject) => {
            if (req.cookies.ox === undefined) {
                reject();
                return;
            }
            // retrieve the session from cache
            let session = this.memCached.get(req.cookies.ox);
            if (session !== undefined) {
                if (session.ip === req.connection.remoteAddress) {
                    if (SessionService.getTime() - session.begun < SESSION_LENGTH) {
                        resolve(session);
                        return;
                    }
                }
                else {
                    reject();
                    return;
                }
            }
            reject();
        });
    }
    authSocketRequest(request_name, flag, socket) {
        const clientCookies = cookie.parse(socket.client.request.headers.cookie);
        return new Promise((resolve, reject) => {
            if (clientCookies.ox === undefined) {
                reject('Session token not present');
                return;
            }
            // retrieve the session from cache
            let session = this.memCached.get(clientCookies.ox);
            let ip = socket.handshake.address;
            if (session !== undefined) {
                if (session.ip === ip) {
                    if (SessionService.getTime() - session.begun < SESSION_LENGTH) {
                        if (session.config.flags.indexOf(flag) !== -1) {
                            resolve(session);
                            return;
                        }
                        else {
                            reject('Session has expired');
                            return;
                        }
                    }
                }
                else {
                    reject('IP Address has changed mid-session');
                    return;
                }
            }
            reject('Requested session doesn\'t exist');
        });
    }
}
exports.default = SessionService;
//# sourceMappingURL=SessionService.js.map