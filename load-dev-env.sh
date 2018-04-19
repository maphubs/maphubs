cat env/dev/db.env > .env
cat env/dev/web.env >> .env
cat env/dev/host.env >> .env
cat env/dev/secret/db-pass.env >> .env
cat env/dev/secret/web-secret.env >> .env

source .env
export $(cut -d= -f1 .env)

if [ -z ${OMH_REMOTE_THEME} ]
then
  cp ./src/sass/themes/${OMH_THEME}.scss ./src/theme.scss
else
  wget -O /app/src/theme.scss ${OMH_REMOTE_THEME}
fi

./node_modules/node-sass/bin/node-sass --output-style compressed --source-map true ./src/maphubs.scss ./css/maphubs.css

#work-around old babel configs
touch ./node_modules/dnd-core/.babelrc
rm ./node_modules/dnd-core/.babelrc
touch ./node_modules/reactcss/.babelrc
rm ./node_modules/reactcss/.babelrc