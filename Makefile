SPEC_DIR=spec/
SRC=src/quantities.js

test:
	jasmine-node $(SPEC_DIR)

lint:
	jshint $(SRC)
	jscs $(SRC)

bench:
	bin/bench.rb

.PHONY: bench lint test
