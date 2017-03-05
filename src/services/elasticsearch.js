//@flow
var elasticsearch = require('elasticsearch');
var local = require('../local');
var log = require('../services/log');

/**
 * Singleton wrapper around Elasticsearch client object
 */
module.exports = {
  client: null,
  
  getClient(){
    if(!this.client){
      var host: string = local.elasticSearchHost ? local.elasticSearchHost : 'localhost';
      var port: string = local.elasticSearchPort ? local.elasticSearchPort : '9200';
      var user: string = local.elasticSearchUser ? local.elasticSearchUser : 'elastic';
      var pass: string = local.elasticSearchPass ? local.elasticSearchPass : 'changeme';
      this.client = new elasticsearch.Client({
        host: host + ':' + port,
        log: 'warning',
        httpAuth: user + ':' + pass
      });
    }

    return this.client;
  },

  testClient(cb: Function){
    if(!this.client){
      log.error('elasticsearch client not configured');
    }else{
       this.client.ping({
      requestTimeout: 30000,
    }, error => {
      if (error) {
        log.error('elasticsearch cluster is down!');
      } else {
        log.info('elasticsearch is connection successful');
      }
      cb(error);
    });
    }
   
  }
};