/* @flow weak */
module.exports = {
  getBaseUrl(internal){
    var host;
    if(internal){
       host = MAPHUBS_CONFIG.host_internal;
    }else{
       host = MAPHUBS_CONFIG.host;
    }
    var port = MAPHUBS_CONFIG.port;
    var proto = 'http://';
    if(MAPHUBS_CONFIG.https) proto = 'https://';
    var url = proto +  host;
    if(port != 80){
      url += ':' + port;
    }
    return  url;
  }
};
