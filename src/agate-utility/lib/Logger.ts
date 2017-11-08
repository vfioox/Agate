class Logger {
    /**
     * Logging class utility
     * @constructor
     */
    constructor(){

    }
    /**
     * Generates a pretty timestamp
     * @returns "yyyy-mm-dd HH-mm-ss"
     */
    public static getDateTime = function() {
        const date = new Date();

        // + unary operator keeps the datatypes correct

        let hour = date.getHours();
        hour = + (hour < 10 ? '0' : '') + hour;

        let min = date.getMinutes();
        min = + (min < 10 ? '0' : '') + min;

        let sec = date.getSeconds();
        sec = + (sec < 10 ? '0' : '') + sec;

        let year = date.getFullYear();

        let month = date.getMonth() + 1;
        month = + (month < 10 ? '0' : '') + month;

        let day = date.getDate();
        day = + (day < 10 ? '0' : '') + day;

        return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    };
    /**
     * Logs a standard formatted message
     * @param field Field name for the message, specified before the message
     * @param data an array of strings to log
     * @returns void
     */
    public static Std(field, ...data): void {
        return console.log(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    public static Err(field, ...data): void {
        return console.error(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    public static Wrn(field, ...data): void {
        return console.warn(`[${Logger.getDateTime()}] [${field.toUpperCase()}] `, data.join(' '));
    }
    public static Tim(field): void {
        return console.time(field);
    }
    public static Tie(field): void {
        return console.timeEnd(field);
    }
}

export default Logger;
