import * as haystack from 'haystack-client';
import {BlobContentType} from './blob_content_type';

export interface BlobClient {
    name(): string;
    writeResponseBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void;
    writeRequestBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void;
    close(callback: () => void): void;
}
