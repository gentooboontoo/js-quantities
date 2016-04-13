#!/bin/bash

set -e

VERSION=$(cat RELEASE)

git add History.md README.md bower.json package.json RELEASE src/quantities.js
git commit -m "Release v${VERSION}"
git tag "v${VERSION}"
git push origin master
npm publish
