import CustomConfig from './config/Custom';
import WebConfig from './config/Web';

interface ConfigEcosystem {
    web: WebConfig,
    custom: CustomConfig
}

export default ConfigEcosystem;
