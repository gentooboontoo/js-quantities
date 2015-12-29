SPEC_DIR=spec/
SRC=src/quantities.js

test:
	jasmine-node $(SPEC_DIR)

lint:
	jshint $(SRC)
	jscs $(SRC)

.PHONY: lint test
