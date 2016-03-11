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
  },
  getHubUrl(hub, host, port){
    var proto = 'http://';
    //if(config.https) proto = 'https://';
    var url = proto + hub + '.' + host;
    if(port != 80){
      url += ':' + port;
    }
    return  url;
  },

  getHostFromHub(host){
    //give then usual host value, see if it has a hub_id on the front and remove it
    var parts = host.split('.');
    if(parts[parts.length-1] == 'com'){
      if(parts.length == 2){
        //no subdomain
        return parts[0] + '.' + parts[1];
      }else if(parts.length == 3) {
        if(parts[0] == 'dev' || parts[0] == 'demo' || parts[0] == 'beta'){
          //assume these are special and not hubs
          return parts[0] + '.' + parts[1] + '.' + parts[2];
        }else{
          //assume first part is a hub
          return parts[1] + '.' + parts[2];
        }
      }else if(parts.length == 4) {
        //must by a hub + a subdomain host
        return parts[1] + '.' + parts[2] + '.' + parts[3];
      }
    }else if(parts[parts.length-1] == 'localhost'){
      return 'dev.localhost';
    }

  }

};
