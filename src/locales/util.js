// @flow
const supported = require('./supported.json')
module.exports = {
  getSupported () {
    return supported
  },
  getConfig (code: string) {
    let config = {value: 'UNK', label: 'UNK', name: 'UNKNOWN'}
    this.getSupported().map(l => {
      if (l.value === code) {
        config = l
      }
    })
    return config
  },
  getEmptyLocalizedString (): LocalizedString {
    const localizedString: LocalizedString = {}
    supported.map(l => {
      localizedString[l.value] = ''
    })
    return localizedString
  }
}
