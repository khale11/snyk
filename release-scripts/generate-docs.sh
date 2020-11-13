#!/usr/bin/env bash
set -e

if ! command -v ronn &> /dev/null
then
    gem install ronn-ng
fi

# Generate markdown docs
npx ts-node ./help/help-generator/generate.ts
