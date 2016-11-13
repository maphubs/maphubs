/* @flow weak */
module.exports = {
  getBaseUrl(){
    var host = MAPHUBS_CONFIG.host;
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
