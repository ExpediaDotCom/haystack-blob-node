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

import * as haystack from 'haystack-client';
import {Dispatcher} from './dispatcher';
import NullLogger from '../logger';
import * as grpc from 'grpc';
const messages  = require('../proto_idl_codegen/blobAgent_pb');
const services  = require('../proto_idl_codegen/blobAgent_grpc_pb');
import {BlobContentType} from '../blob_content_type';

export default class RemoteDispatcher implements Dispatcher {
    _client: any;
    _logger: any;

    constructor(agentHost: string, agentPort: number, logger = new NullLogger()) {
        agentHost = agentHost || 'haystack-agent';
        agentPort = agentPort || 34100;
        logger.info(`Initializing the remote blob dispatcher, connecting at ${agentHost}:${agentPort}`);
        this._client = new services.BlobAgentClient(`${agentHost}:${agentPort}`, grpc.credentials.createInsecure());
        this._logger = logger;
    }

    name(): string {
        return 'RemoteDispatcher';
    }

    dispatch(span: haystack.Span, blobPayload: Buffer, blobType: string, contentType: BlobContentType, callback: (error) => void): void {
        const blob = this._convertToProtoBlob(span, blobPayload, blobType, contentType);
        this._client.dispatch(blob, (err, response) => {
            if (err) {
                this._logger.error(`Fail to dispatch blob to haystack-agent ${err.toString()}`);
                if (callback) {
                    callback(new Error(err));
                }
            } else {
                this._logger.debug(`grpc response code from haystack-agent for blob dispatch - ${response.getCode()}`);
                if (callback) {
                    callback(null);
                }
            }
        });
    }

    close(callback: () => void): void {
        this._logger.info('closing the blob grpc client now..');
        grpc.closeClient(this._client);
        if (callback) {
            callback();
        }
    }

    private _convertToProtoBlob(span: haystack.Span, blobPayload: Buffer, blobType: string, contentType: BlobContentType): any {
        const protoBlob = new messages.Blob();
        const spanCtx = span.context();
        const requestId = spanCtx.parentSpanId() || spanCtx.traceId();

        protoBlob.setClient(span.serviceName());
        protoBlob.setTransactionid(spanCtx.traceId());
        protoBlob.setEventid(spanCtx.spanId());
        protoBlob.setRequestid(requestId);
        protoBlob.setTimestamp(Date.now());
        protoBlob.setContent(blobPayload);
        protoBlob.setContenttype(contentType.toString());

        if (blobType === 'RESPONSE') {
            protoBlob.setBlobtype(messages.Blob.BlobType.RESPONSE);
        } else {
            protoBlob.setBlobtype(messages.Blob.BlobType.REQUEST);
        }
        return protoBlob;
    }
}
