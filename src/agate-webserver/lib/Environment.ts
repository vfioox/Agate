import * as fs from 'fs';
import * as root from 'app-root-path';
import * as BlueBird from 'bluebird';
import ConfigEcosystem from './interface/ConfigEcosystem';

// promisifying the stock fs lib
const fsAsync = BlueBird.promisifyAll(fs);

const CONFIG_PATH = '/environment/';
const CONFIG_EXTENSION = 'json';

class Environment {
    public settingsLoaded = false;
    public config: ConfigEcosystem;

    // initializes a new environment with file-based settings
    /**
     * Environment class for file-based configurations
     * @constructor
     */
    constructor() {

    }

    // helper functions
    /**
     * Mounts according route rules as specified in configuration
     * @param name Config file name to load
     * @returns absolute path to the config file
     */
    private static configPath(name: string): string {
        return root + CONFIG_PATH + `${name}.${CONFIG_EXTENSION}`;
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param buffer Buffer to convert to string
     * @returns a promise of a string
     */
    private static bufferToString(buffer: Buffer): Promise<string> {
        return Promise.resolve(buffer.toString());
    }
    /**
     * Mounts according route rules as specified in configuration
     * @param buffer Buffer to convert to string
     * @returns a promise of the parsed JSON object
     */
    private static stringToJSON(buffer: string): Promise<any> {
        return Promise.resolve(JSON.parse(buffer));
    }

    // load a file in a promise chain
    /**
     * Loads a file from the config directory
     * @returns a promise of the parsed config object
     */
    private loadSettingsFile(configFileName: string): Promise<any> {
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
    public async loadEnvironment(): Promise<ConfigEcosystem> {
        if (this.config === undefined) {
            this.config = await BlueBird.props({
                'web': this.loadSettingsFile('web_settings'),
                'custom': this.loadSettingsFile('custom')
            });
            return this.config;
        } else {
            return Promise.resolve(this.config);
        }
    }
}

export default new Environment();
