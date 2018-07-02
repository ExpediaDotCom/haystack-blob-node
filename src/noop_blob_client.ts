import * as haystack from 'haystack-client';
import {BlobClient} from './blobclient';
import {BlobContentType} from './blob_content_type';

export default class NoopBlobClient implements BlobClient {
    constructor() {}

    name(): string {
        return 'NoopBlobClient';
    }

    writeResponseBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void {
        if (callback) {
            callback();
        }
    }

    writeRequestBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void {
        if (callback) {
            callback();
        }
    }

    close(callback: () => void): void {
        if (callback) {
            callback();
        }
    }
}
