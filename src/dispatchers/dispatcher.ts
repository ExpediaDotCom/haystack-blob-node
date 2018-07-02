import * as haystack from 'haystack-client';
import {BlobContentType} from '../blob_content_type';

export interface Dispatcher {
    name(): string;
    dispatch(span: haystack.Span, blobPayload: Buffer, blobType: string, contentType: BlobContentType, callback: (error) => void): void;
    close(callback: () => void): void;
}
