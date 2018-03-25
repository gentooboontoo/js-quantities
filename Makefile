SPEC_DIR := spec
SPECFILES := $(shell find $(SPEC_DIR) -iname '*.js')
SOURCE_DIR := src
SOURCES := $(shell find $(SOURCE_DIR) -iname '*.js')
LINTEDFILES := $(SOURCES) $(SPECFILES)
BUILD_DIR := build
ESM_FILE := $(BUILD_DIR)/quantities.esm.js
UMD_FILE := $(BUILD_DIR)/quantities.js
DIST_FILES := $(ESM_FILE) $(UMD_FILE)
BANNER := $(shell cat LICENSE)

build: $(DIST_FILES)

$(UMD_FILE): $(SOURCES)
	rollup --file=$(UMD_FILE) \
         --format=umd \
         --name=Qty \
         --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
         src/quantities.js

$(ESM_FILE): $(SOURCES)
	rollup --file=$(ESM_FILE) \
         --format=es \
         --name=Qty \
         --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
         src/quantities.js

test: lint build
	jasmine-node $(SPEC_DIR)

lint: $(LINTEDFILES)
	jshint $(LINTEDFILES)
	jscs $(LINTEDFILES)

bench:
	bin/bench.rb

clean:
	rm -f $(DIST_FILES)

.PHONY: bench build clean lint test
