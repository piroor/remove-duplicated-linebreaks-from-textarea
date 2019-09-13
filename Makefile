NPM_MOD_DIR := $(CURDIR)/node_modules
NPM_BIN_DIR := $(NPM_MOD_DIR)/.bin

.PHONY: xpi install_dependency lint format

all: xpi

install_dependency:
	npm install

lint:
	$(NPM_BIN_DIR)/eslint . --ext=.js --report-unused-disable-directives
	find . -type d -name node_modules -prune -o -type f -name '*.json' -print | \
	  while read path; \
	  do \
	    "$(NPM_BIN_DIR)/jsonlint" -q "$$path" || exit 1; \
	  done

format:
	$(NPM_BIN_DIR)/eslint . --ext=.js --report-unused-disable-directives --fix

xpi:
	rm -f ./*.xpi
	zip -r -0 remove-duplicated-linebreaks-from-textarea.xpi manifest.json _locales background -x '*/.*' >/dev/null 2>/dev/null

