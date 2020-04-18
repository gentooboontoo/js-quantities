SPEC_DIR := spec
SPECFILES := $(shell find $(SPEC_DIR) -iname '*.js')
SOURCE_DIR := src
SOURCES := $(shell find $(SOURCE_DIR) -iname '*.js')
LINTEDFILES := $(SOURCES) $(SPECFILES)
BUILD_DIR := build
ESM_FILE := $(BUILD_DIR)/quantities.mjs
UMD_FILE := $(BUILD_DIR)/quantities.js
DIST_FILES := $(ESM_FILE) $(UMD_FILE)
BANNER := $(shell cat LICENSE)

NPM_BIN := $(shell npm bin)
ROLLUP := $(NPM_BIN)/rollup
JASMINE := $(NPM_BIN)/jasmine
ESLINT := $(NPM_BIN)/eslint

build: $(DIST_FILES)

$(UMD_FILE): $(SOURCES)
	$(ROLLUP) --file=$(UMD_FILE) \
            --format=umd \
            --name=Qty \
            --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
            src/quantities.js

$(ESM_FILE): $(SOURCES)
	$(ROLLUP) --file=$(ESM_FILE) \
            --format=es \
            --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
            src/quantities.js

test: lint build
	$(JASMINE)

lint: $(LINTEDFILES)
	$(ESLINT) $(LINTEDFILES)

bench:
	bin/bench.rb

clean:
	rm -f $(DIST_FILES)

.PHONY: bench build clean lint test
