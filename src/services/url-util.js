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
  },

  getUrlParameter(sParam) {
    if(typeof window === 'undefined') return;
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
  }
};
