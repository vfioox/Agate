"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agate_utility_1 = require("../../agate-utility");
class Plugins {
    /**
     * Class responsible for managing plugins
     * @constructor
     */
    constructor() {
        this.pluginData = {};
        this.loaded = false;
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param environment Configuration Ecosystem class instance
     * @returns promise of an array containing objects describing loaded plugins
     */
    PromisePluginsLoad(environment) {
        let fs = require('fs');
        let dir = require('app-root-path') + '/src/plugins';
        let vm = this;
        if (this.loaded)
            return Promise.resolve(this.pluginData);
        return new Promise((resolve, reject) => {
            fs.readdir(dir, function (err, files) {
                if (err || files === undefined) {
                    return reject(err);
                }
                files.forEach(function (file) {
                    if (file.indexOf('.') !== -1)
                        return;
                    let manifestPath = dir + '/' + file + '/manifest.json';
                    let manifest = JSON.parse(fs.readFileSync(manifestPath));
                    if (manifest.production === true && environment.web.production) {
                        vm.pluginData[manifest.code] = manifest;
                        agate_utility_1.Logger.Std('plugins', `Loaded production plugin ${manifest.name} by ${manifest.author}`);
                    }
                    else if (manifest.production === false) {
                        vm.pluginData[manifest.code] = manifest;
                        agate_utility_1.Logger.Std('plugins', `Loaded plugin ${manifest.name} by ${manifest.author}`);
                    }
                });
                resolve(vm.pluginData);
            });
        });
    }
}
exports.default = new Plugins();
//# sourceMappingURL=Plugins.js.map