#!/usr/bin/env bash

#
# this script exists to avoid require()-ing a file outside of the src/ path
# which would change the structure of our dist folder
#

VERSION=$(node -e "console.log(require('./package.json').version)" | tr -d '[:space:]')

echo "Running replace: s/VERSION_BUILD_REPLACE/$VERSION/"

sed -i.bak "s/VERSION_BUILD_REPLACE/$VERSION/" dist/bin.js
