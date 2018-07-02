import * as haystack from 'haystack-client';
import {Dispatcher} from './dispatcher';
import * as fs from 'fs';
import NullLogger from '../logger';
import {BlobContentType} from '../blob_content_type';

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
            const blobFilePath = this._blobFilePath(span, blobType);
            fs.writeFile(blobFilePath, blobPayload.toString('utf-8'), err => {
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
