"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    /**
     * Logging class utility
     * @constructor
     */
    constructor() {
    }
    /**
     * Logs a standard formatted message
     * @param field Field name for the message, specified before the message
     * @param data an array of strings to log
     * @returns void
     */
    static Std(field, ...data) {
        return console.log(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    static Err(field, ...data) {
        return console.error(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    static Wrn(field, ...data) {
        return console.warn(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    static Tim(field) {
        return console.time(field);
    }
    static Tie(field) {
        return console.timeEnd(field);
    }
}
/**
 * Generates a pretty timestamp
 * @returns "yyyy-mm-dd HH-mm-ss"
 */
Logger.getDateTime = function () {
    const date = new Date();
    // + unary operator keeps the datatypes correct
    let hour = date.getHours();
    hour = +(hour < 10 ? '0' : '') + hour;
    let min = date.getMinutes();
    min = +(min < 10 ? '0' : '') + min;
    let sec = date.getSeconds();
    sec = +(sec < 10 ? '0' : '') + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = +(month < 10 ? '0' : '') + month;
    let day = date.getDate();
    day = +(day < 10 ? '0' : '') + day;
    return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
};
exports.default = Logger;
//# sourceMappingURL=Logger.js.map