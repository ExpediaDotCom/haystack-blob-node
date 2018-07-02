[![Build Status](https://travis-ci.org/ExpediaDotCom/haystack-blob-node.svg?branch=master)](https://travis-ci.org/ExpediaDotCom/haystack-blob-node)
[![License](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](https://github.com/ExpediaDotCom/haystack/blob/master/LICENSE)

# Haystack Blobs Library 

node module that dispatches req/resp blobs to haystack-agent and add corresponding span tag

## How to use the library?

### You need to have npm registry to point to the following URL
http://nexuslab.alm/nexus/content/groups/npm-all/

Check our detailed [example](examples/index.js) on how to initialize opentracing haystack tracer, blob client, start a span, write request/response blobs and send it to one of the dispatchers.


## How to build this library?

`make build`

This library has been written in typescript, so we first compile them into js files under dist/ folder

## How to run the example code
```bash
make build
mkdir -p logs && node dist/examples/index.js
```

