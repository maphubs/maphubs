#!/bin/bash
cat env/dev/db.env > .env
cat env/dev/web.env >> .env
cat env/dev/host.env >> .env
cat env/dev/secret/db-pass.env >> .env
cat env/dev/secret/web-secret.env >> .env

source .env
export $(cut -d= -f1 .env)


#work-around old babel configs
#touch ./node_modules/dnd-core/.babelrc
#rm ./node_modules/dnd-core/.babelrc
#touch ./node_modules/reactcss/.babelrc
#rm ./node_modules/reactcss/.babelrc