SPEC_DIR := spec
SPECFILES := $(shell find $(SPEC_DIR) -iname '*.js')
SOURCE_DIR := src
SOURCES := $(shell find $(SOURCE_DIR) -iname '*.js')
LINTEDFILES := $(SOURCES) $(SPECFILES)
DISTFILE := build/quantities.js
BANNER := $(shell cat LICENSE)

build: $(DISTFILE)

$(DISTFILE): $(SOURCES)
	rollup --output.file=$(DISTFILE) \
         --output.format=umd \
         --name=Qty \
         --banner="`echo '/*'; cat LICENSE; echo '*/'`" \
         src/quantities.js

test: build
	jasmine-node $(SPEC_DIR)

lint:
	jshint $(LINTEDFILES)
	jscs $(LINTEDFILES)

bench:
	bin/bench.rb

clean:
	rm -f $(DISTFILE)

.PHONY: bench build clean lint test
