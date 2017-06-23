curl -XPUT -u elastic 'localhost:9200/_xpack/security/user/elastic/_password' -d '{
  "password" : ""
}'

curl -XPUT -u elastic 'localhost:9200/_xpack/security/user/kibana/_password' -d '{
  "password" : ""
}'

curl -XPUT -u elastic 'localhost:9200/_xpack/license' -H "Content-Type: application/json" -d @license.json