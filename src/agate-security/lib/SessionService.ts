import Session from './interface/Session';
import * as NodeCache from 'node-cache';
import * as cookie from 'cookie';
import {Logger} from '../../agate-utility';

const SESSION_LENGTH = 60 * 60 * 24 * 2;

class SessionService {
    public memCached;

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
    public static getTime(): number {
        return Math.round(new Date().getTime() / 1000);
    }

    /**
     * Returns session length constant
     * @returns session length
     */
    public static getSessionLength(): number {
        return SESSION_LENGTH;
    }

    /**
     * Initializes a new session
     * @returns void
     */
    public newSession(ox, username, ip, master?): void {
        let session = {} as Session;

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
                Logger.Std('new session', ox, status);
            })
            .catch((err) => {
                Logger.Err('new session', ox, err);
            });
    }

    public async doesExist(ox: string): Promise<boolean> {
        let getData = await this.memCached.getAsync(ox);
        return Promise.resolve(ox !== undefined && getData !== undefined);
    }

    /**
     * Authorizes an express request
     * @param req Request object from express
     * @returns {Promise} a promise of the session
     */
    public authExpressRequest(req): Promise<Session> {
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
                } else {
                    reject();
                    return;
                }
            }
            reject();
        });
    }

    public authSocketRequest(request_name: string, flag: string, socket: any) {
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
                        } else {
                            reject('Session has expired');
                            return;
                        }
                    }
                } else {
                    reject('IP Address has changed mid-session');
                    return;
                }
            }
            reject('Requested session doesn\'t exist');
        });
    }
}

export default SessionService;
