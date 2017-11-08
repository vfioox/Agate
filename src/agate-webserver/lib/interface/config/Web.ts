import Route from './Route';
import TemplateRoute from './TemplateRoute';

interface WebConfig {
    port: number,
    front: {
        path: string,
        index: {
            route: string,
            file: string
        },
        login: {
            route: string,
            file: string
        }
        styles: {
            [propName: string]: Route
        },
        js: {
            app: Route,
            lib: Route
        },
        routes: {
            [propName: string]: TemplateRoute
        }
    },
    production: boolean,
    memCachedLocations: [string],
    defaultMaster: {
        login: string,
        password: string
    }
}

export default WebConfig;
