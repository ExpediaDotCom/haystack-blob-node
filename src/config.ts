import {Dispatcher} from './dispatchers/dispatcher';
import RawFileDispatcher from './dispatchers/raw_file';
import {BlobClient} from './blobclient';
import NoopBlobClient from './noop_blob_client';
import BlobClientImpl from './blob_client_impl';
import RemoteDispatcher from './dispatchers/remote';
import OfflineAgentDispatcher from './dispatchers/offline_agent_dispatcher';

export default class Configuration {
    static _getDispatcher(config): Dispatcher {

        const dispatcher = config.dispatcher;
        if (dispatcher) {
            switch (dispatcher.type) {
                case 'raw_file':
                    return new RawFileDispatcher(dispatcher.blobDirPath, config.logger);
                case 'haystack_agent':
                    return new RemoteDispatcher(dispatcher.agentHost, dispatcher.agentPort, config.logger);
                case 'haystack_offline_agent':
                    return new OfflineAgentDispatcher('/haystack_blobs', config.logger);
                default:
                    throw new Error(`dispatcher of type ${dispatcher} is not unknown`);
            }
        }
        return null;
    }

    static initBlobClient(config): BlobClient {
        if (config.disable) {
            return new NoopBlobClient();
        }
        if (!config.dispatcher) {
            throw new Error(`Fail to construct blob client as either service name or dispatcher is incorrect`);
        }
        const dispatcher = Configuration._getDispatcher(config);
        return new BlobClientImpl(dispatcher, config.logger);
    }
}
