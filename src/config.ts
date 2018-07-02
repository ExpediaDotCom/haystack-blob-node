/*
 *  Copyright 2018 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 */

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
