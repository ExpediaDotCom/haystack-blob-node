// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
//
//
//  Copyright 2017 Expedia, Inc.
//
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
//         http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
//     distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//     limitations under the License.
//
'use strict';
var grpc = require('grpc');
var blobAgent_pb = require('./blobAgent_pb.js');

function serialize_Blob(arg) {
  if (!(arg instanceof blobAgent_pb.Blob)) {
    throw new Error('Expected argument of type Blob');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_Blob(buffer_arg) {
  return blobAgent_pb.Blob.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_DispatchResult(arg) {
  if (!(arg instanceof blobAgent_pb.DispatchResult)) {
    throw new Error('Expected argument of type DispatchResult');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_DispatchResult(buffer_arg) {
  return blobAgent_pb.DispatchResult.deserializeBinary(new Uint8Array(buffer_arg));
}


// service interface to push spans to haystack agent
var BlobAgentService = exports.BlobAgentService = {
  dispatch: {
    path: '/BlobAgent/dispatch',
    requestStream: false,
    responseStream: false,
    requestType: blobAgent_pb.Blob,
    responseType: blobAgent_pb.DispatchResult,
    requestSerialize: serialize_Blob,
    requestDeserialize: deserialize_Blob,
    responseSerialize: serialize_DispatchResult,
    responseDeserialize: deserialize_DispatchResult,
  },
  // dispatch blob to haystack agent
};

exports.BlobAgentClient = grpc.makeGenericClientConstructor(BlobAgentService);
