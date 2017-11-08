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
const fs = require("fs");
const root = require("app-root-path");
const BlueBird = require("bluebird");
// promisifying the stock fs lib
const fsAsync = BlueBird.promisifyAll(fs);
const CONFIG_PATH = '/environment/';
const CONFIG_EXTENSION = 'json';
class Environment {
    // initializes a new environment with file-based settings
    /**
     * Environment class for file-based configurations
     * @constructor
     */
    constructor() {
        this.settingsLoaded = false;
    }
    // helper functions
    /**
     * Mounts according route rules as specified in configuration
     * @param name Config file name to load
     * @returns absolute path to the config file
     */
    static configPath(name) {
        return root + CONFIG_PATH + `${name}.${CONFIG_EXTENSION}`;
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param buffer Buffer to convert to string
     * @returns a promise of a string
     */
    static bufferToString(buffer) {
        return Promise.resolve(buffer.toString());
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param buffer Buffer to convert to string
     * @returns a promise of the parsed JSON object
     */
    static stringToJSON(buffer) {
        return Promise.resolve(JSON.parse(buffer));
    }
    // load a file in a promise chain
    /**
     * Loads a file from the config directory
     * @returns a promise of the parsed config object
     */
    loadSettingsFile(configFileName) {
        return fsAsync.readFileAsync(Environment.configPath(configFileName))
            .then((buffer) => Environment.bufferToString(buffer))
            .then((output) => Environment.stringToJSON(output))
            .catch((e) => {
            throw e;
        });
    }
    // returning a wholesome prop, waiting for all of the promises
    // to be fulfilled before returning
    /**
     * Mounts according route rules as specified in configuration
     * @returns a promise of the config ecosystem class instance
     */
    loadEnvironment() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config === undefined) {
                this.config = yield BlueBird.props({
                    'web': this.loadSettingsFile('web_settings'),
                    'custom': this.loadSettingsFile('custom')
                });
                return this.config;
            }
            else {
                return Promise.resolve(this.config);
            }
        });
    }
}
exports.default = new Environment();
//# sourceMappingURL=Environment.js.map