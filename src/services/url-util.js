// @flow
module.exports = {
  getBaseUrl (internal: boolean = false): string {
    let host, port
    if (internal) {
      host = MAPHUBS_CONFIG.host_internal
      port = MAPHUBS_CONFIG.internal_port
    } else {
      host = MAPHUBS_CONFIG.host
      port = MAPHUBS_CONFIG.port
    }
    let proto = 'http://'
    if (MAPHUBS_CONFIG.https && !internal) proto = 'https://'
    let url = proto + host
    if (port !== 80) {
      url += ':' + port
    }
    return url
  },

  getUrlParameter (sParam: string) {
    if (typeof window === 'undefined') return
    const sPageURL = decodeURIComponent(window.location.search.substring(1))
    const sURLVariables = sPageURL.split('&')
    let sParameterName, i

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=')

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1]
      }
    }
  }
}
