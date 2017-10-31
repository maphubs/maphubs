curl -XPUT -u elastic 'localhost:9200/_xpack/security/user/elastic/_password' -d '{
  "password" : ""
}'

curl -XPUT -u elastic 'localhost:9200/_xpack/security/user/kibana/_password' -d '{
  "password" : ""
}'
curl -XPUT -u elastic 'http://<host>:<port>/_xpack/license?acknowledge=true' -H "Content-Type: application/json" -d @license.json