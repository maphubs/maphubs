/* @flow weak */
var config = require('../clientconfig');
module.exports = {

  getBaseUrl(host, port){
    var proto = 'http://';
    if(config.https) proto = 'https://';
    var url = proto +  host;
    if(port != 80){
      url += ':' + port;
    }
    return  url;
  }

};
