#!/bin/bash

set -e

VERSION=$(cat RELEASE)
TAG=v${VERSION}

git add History.md README.md bower.json package.json RELEASE src/quantities.js
git commit -m "Release ${TAG}"
git tag "${TAG}"
git push origin master "${TAG}"
npm publish
