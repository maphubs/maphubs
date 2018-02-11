#!/bin/sh
if [ -z ${OMH_REMOTE_THEME} ]
then
  cp /app/src/sass/themes/${OMH_THEME}.scss /app/src/theme.scss
else
  wget -O /app/src/theme.scss ${OMH_REMOTE_THEME}
fi

#create themed css
mkdir -p /app/css
/app/node_modules/node-sass/bin/node-sass --output-style compressed --source-map true /app/src/maphubs.scss /app/css/maphubs.css

#work-around old babel configs
touch ./node_modules/dnd-core/.babelrc
rm ./node_modules/dnd-core/.babelrc
touch ./node_modules/reactcss/.babelrc
rm ./node_modules/reactcss/.babelrc

#run any pending database migrations
node --max-old-space-size=$NODE_MEM_SIZE node_modules/knex/bin/cli.js --knexfile=src/knexfile.js migrate:latest --env production

#start server
node --max-old-space-size=$NODE_MEM_SIZE src/app.js
