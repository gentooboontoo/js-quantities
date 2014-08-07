BUILD_DIR := build

build: $(BUILD_DIR)/quantities.js

$(BUILD_DIR)/quantities.js: src/quantities.js
	compile-modules convert --include src/ \
	                        --output build/quantities.js \
	                        --format bundle src/*.js

clean:
	[ ! -d $(BUILD_DIR) ] || rm -rf $(BUILD_DIR)/*

spec: build
	jasmine-node spec/

.PHONY: build clean spec
