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
import {BlobContentType} from './blob_content_type';

export interface BlobClient {
    name(): string;
    writeResponseBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void;
    writeRequestBlob(span: haystack.Span, blobPayload: Buffer, contentType: BlobContentType, callback: () => void): void;
    close(callback: () => void): void;
}
