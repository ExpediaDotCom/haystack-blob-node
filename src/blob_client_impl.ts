import {BlobClient} from './blobclient';
import {Dispatcher} from './dispatchers/dispatcher';
import * as haystack from 'haystack-client';
import NullLogger from './logger';
import {BlobContentType} from './blob_content_type';

export default class BlobClientImpl implements BlobClient {
    _dispatcher: Dispatcher;
    _logger: any;

    constructor(dispatcher: Dispatcher, logger = new NullLogger()) {
        this._dispatcher = dispatcher;
        this._logger = logger;
    }

    name(): string {
        return 'BlobClientImpl';
    }

    writeResponseBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void {
        this._writeBlob(span, blobPayload, 'RESPONSE', contentType, callback);
    }

    writeRequestBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void {
        this._writeBlob(span, blobPayload, 'REQUEST', contentType, callback);
    }

    close(callback: () => void): void {
        this._dispatcher.close(callback);
    }

    private _writeBlob(span: haystack.Span, blobPayload: Buffer, blobType: string, contentType: BlobContentType, callback: () => void): void {
        if (span.isFinished()) {
            throw new Error(`Fail to write the blob to an already closed haystack span`);
        }
        const spanCtx = span.context();
        span.setTag(`Blob-${blobType}`, `/getBlob/${span.serviceName()}/${blobType}/${spanCtx.traceId()}/${spanCtx.parentSpanId()}/${spanCtx.spanId()}`);
        this._dispatcher.dispatch(span, blobPayload, blobType, contentType, callback);
    }
}
