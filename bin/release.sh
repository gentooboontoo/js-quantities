#!/bin/bash

set -e

VERSION=$(cat RELEASE)
TAG=v${VERSION}

git add History.md README.md bower.json package.json \
        RELEASE src/quantities.js build/quantities.js build/quantities.esm.js
git commit -m "Release ${TAG}"
git tag "${TAG}"
git push github master "${TAG}"

git checkout gh-pages
git show master:README.md > index.md
git add index.md
git commit -m "Update index.md"
git push github gh-pages

git checkout master
npm publish
