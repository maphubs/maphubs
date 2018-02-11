#!/bin/sh
cp /app/src/sass/themes/${OMH_THEME}.scss /app/src/theme.scss
node --max-old-space-size=$NODE_MEM_SIZE src/app.js
