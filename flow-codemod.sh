#!/bin/sh
node ./node_modules/flow-bin/cli.js codemod annotate-exports \
  --write \
  --repeat \
  --log-level info \
  $1