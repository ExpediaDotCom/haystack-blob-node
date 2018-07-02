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
import * as fs from 'fs';
import NullLogger from '../logger';
import {BlobContentType} from '../blob_content_type';
import base64 = require('base-64');
import dateFormat = require('dateformat');
import Utils from '../utils';

export default class OfflineAgentDispatcher implements Dispatcher {
    _blobDirectory: string;
    _logger: any;

    constructor(blobDirectory: string, logger = new NullLogger()) {
        if (!blobDirectory) {
            throw new Error(`blob offline agent dispatcher requires a directory path to push all the blobs`);
        }
        logger.info(`Offline blob dispatcher successfully initialized with '${blobDirectory}' blob dir`);
        this._blobDirectory = blobDirectory;
        this._logger = logger;
    }

    name(): string {
        return 'OfflineAgentDispatcher';
    }

    static _currentHourBlobsDirname(): string {
        return dateFormat(new Date(), 'UTC:yyyy-mm-dd-HH');
    }

    _ensureDirectoryExists(span: haystack.Span, callback: (string) => void): void {
        const hourBlobsBucket = `${this._blobDirectory}/${OfflineAgentDispatcher._currentHourBlobsDirname()}-blobs`;
        fs.mkdir(hourBlobsBucket, err => {
            if (err && err.code !== 'EEXIST') {
                this._logger.error(`Fail to create the blob directory - ${err}`);
            } else {
                fs.mkdir(`${hourBlobsBucket}/${span.serviceName()}`, err => {
                    if (err && err.code !== 'EEXIST') {
                        this._logger.error(`Fail to create the blob directory - ${err}`);
                    } else {
                        callback(`${hourBlobsBucket}/${span.serviceName()}`);
                    }
                });
            }
        });
    }

    dispatch(span: haystack.Span, blobPayload: Buffer, blobtype: string, contenttype: BlobContentType, callback: (error) => void): void {
        this._ensureDirectoryExists(span, blobDir => {
            const blobFilePath = Utils.blobFilePath(span, blobDir, blobtype);
            console.log(blobFilePath);

            const blobWithMetadata = {
                client: span.serviceName(),
                timestamp: Date.now(),
                transactionid: span.context().traceId(),
                eventid: span.context().spanId(),
                requestid: span.context().parentSpanId(),
                blobType: blobtype,
                contentType: contenttype.toString(),
                content: base64.encode(blobPayload)
            };

            fs.writeFile(blobFilePath, JSON.stringify(blobWithMetadata), err => {
                if (callback) {
                    callback(err);
                }
            });
        });
    }

    close(callback: () => void): void { }
}
