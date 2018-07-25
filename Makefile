MIN_NODE_VER=6
NODE_VER=$(shell node -v | cut -d . -f 1 | cut -d v -f 2)

ifeq ($(shell expr $(NODE_VER) \>= $(MIN_NODE_VER)), 1)
    MIN_NODE_VER_FOUND=true
else
    MIN_NODE_VER_FOUND=false
endif

.PHONY: check-node-version
check-node-version:
	@$(MIN_NODE_VER_FOUND) || echo Build requires minimum Node $(MIN_NODE_VER).x

.PHONY: prepare_publish
prepare_publish:
	node scripts/version.js
	cp package.json dist/
	cp README.md dist/

.PHONY: build
build: check-node-version npm_install idl_codegen tslint
	rm -rf ./dist/
	./node_modules/typescript/bin/tsc -p tsconfig.json
	cp -a src/proto_idl_codegen dist/
	cp package.json dist/

.PHONY: tslint
tslint:
	$(shell ./node_modules/tslint/bin/tslint -t msbuild -c tslint.json 'src/**/*.ts')

.PHONY: idl_codegen
idl_codegen:
	rm -rf src/proto_idl_codegen
	mkdir src/proto_idl_codegen
	./node_modules/grpc-tools/bin/protoc -I haystack-blob-idl/ --plugin=protoc-gen-grpc=./node_modules/grpc-tools/bin/grpc_node_plugin --js_out=import_style=commonjs,binary:./src/proto_idl_codegen --grpc_out=./src/proto_idl_codegen haystack-blob-idl/blobAgent.proto

.PHONY: npm_install
npm_install:
	npm install

example: build
	rm -rf logs
	mkdir -p logs
	node examples/index.js
	cat logs/dummy-service/dummy-service_4848fadd-fa16-4b3e-8ad1-6d73339bbee7_*_REQUEST.log
	cat logs/dummy-service/dummy-service_4848fadd-fa16-4b3e-8ad1-6d73339bbee7_*_RESPONSE.log
