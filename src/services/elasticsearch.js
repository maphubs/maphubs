//@flow
const elasticsearch = require('elasticsearch');
const local = require('../local');
const log = require('../services/log');
const Bluebird = require('bluebird');

/**
 * Singleton wrapper around Elasticsearch client object
 */
module.exports = {
  client: null,
  
  getClient(){
    if(!this.client){
      const host: string = local.elasticSearchHost ? local.elasticSearchHost : 'localhost';
      const port: string = local.elasticSearchPort ? local.elasticSearchPort : '9200';
      const user: string = local.elasticSearchUser ? local.elasticSearchUser : 'elastic';
      const pass: string = local.elasticSearchPass ? local.elasticSearchPass : 'changeme';
      this.client = new elasticsearch.Client({
        apiVersion: '5.5',
        host: host + ':' + port,
        log: 'warning',
        httpAuth: user + ':' + pass,
        requestTimeout: 60000,
        defer: () => {
          return Bluebird.defer();
        }
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