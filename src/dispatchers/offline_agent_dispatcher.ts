import * as haystack from 'haystack-client';
import {Dispatcher} from './dispatcher';
import * as fs from 'fs';
import NullLogger from '../logger';
import {BlobContentType} from '../blob_content_type';
import base64 = require('base-64');
import dateFormat = require('dateformat');

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

    _ensureDirectoryExists(span: haystack.Span, callback: () => void): void {
        const hourBlobsBucket = `${this._blobDirectory}/${OfflineAgentDispatcher._currentHourBlobsDirname()}-blobs`;
        fs.mkdir(hourBlobsBucket, err => {
            if (err && err.code !== 'EEXIST') {
                this._logger.error(`Fail to create the blob directory - ${err}`);
            } else {
                fs.mkdir(`${hourBlobsBucket}/${span.serviceName()}`, err => {
                    if (err && err.code !== 'EEXIST') {
                        this._logger.error(`Fail to create the blob directory - ${err}`);
                    } else {
                        callback();
                    }
                });
            }
        });
    }

    dispatch(span: haystack.Span, blobPayload: Buffer, blobtype: string, contenttype: BlobContentType, callback: (error) => void): void {
        this._ensureDirectoryExists(span, () => {
            const blobFilePath = this._blobFilePath(span, blobtype);
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

    private _blobFilePath(span: haystack.Span, blobType: string): string {
        const spanCtx = span.context();
        return `${this._blobDirectory}/${span.serviceName()}/${span.serviceName()}_${spanCtx.traceId()}_${spanCtx.parentSpanId()}_${spanCtx.spanId()}_${blobType}.log`;
    }
}
