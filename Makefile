SPEC_DIR := spec
SOURCE_DIR := src
SOURCES := $(shell find $(SOURCE_DIR) -iname '*.js')
DISTFILE := build/quantities.js
BANNER := $(shell cat LICENSE)

build: $(DISTFILE)

$(DISTFILE): $(SOURCES)
	rollup --output=$(DISTFILE) \
         --format=umd \
         --name=Qty \
         --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
         src/quantities.js

test: build
	jasmine-node $(SPEC_DIR)

lint:
	jshint $(SOURCES)
	jscs $(SOURCES)

bench:
	bin/bench.rb

clean:
	rm -f $(DISTFILE)

.PHONY: bench build clean lint test
