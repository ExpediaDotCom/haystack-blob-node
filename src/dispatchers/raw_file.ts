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
import Utils from '../utils';

export default class RawFileDispatcher implements Dispatcher {
    _blobDirectory: string;
    _logger: any;

    constructor(blobDirectory: string, logger = new NullLogger()) {
        if (!blobDirectory) {
            throw new Error(`blob file dispatcher requires a directory path to push all the blobs`);
        }
        logger.info(`File blob dispatcher successfully initialized with '${blobDirectory}' blob dir`);
        this._blobDirectory = blobDirectory;
        this._logger = logger;
    }

    name(): string {
        return 'RawFileDispatcher';
    }

    dispatch(span: haystack.Span, blobPayload: Buffer, blobType: string, contentType: BlobContentType, callback: (error) => void): void {
        fs.mkdir(`${this._blobDirectory}/${span.serviceName()}`, err => {
            if (err && err.code !== 'EEXIST') {
                this._logger.error(`Fail to create the blob directory - ${err}`);
            }
            const blobFilePath = Utils.blobFilePath(span, `${this._blobDirectory}/${span.serviceName()}`, blobType);
            fs.writeFile(blobFilePath, blobPayload.toString('utf-8'), err => {
                if (callback) {
                    callback(err);
                }
            });
        });
    }

    close(callback: () => void): void { }
}
