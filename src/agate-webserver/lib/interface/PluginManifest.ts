import {Route} from './plugin/Route';
import {Controller} from './plugin/Controller';
import {Method} from './plugin/Method';
import {Job} from './plugin/Job';

interface PluginManifest {
    name: string,
    code: string,
    author: string,
    version: string,
    production: boolean,
    dependency: [string],
    routes?: {
        [propName: string]: Route
    },
    controller?: {
        [propName: string]: Controller
    },
    operators?: {
        universe: string,
        methods: {
            [propName: string]: Method
        }
    },
    jobs?: [Job]
}

export default PluginManifest;
