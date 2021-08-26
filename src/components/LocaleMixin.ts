import Locales from '../services/locales'
const LocaleMixin = {
  __(text) {
    return Locales.getLocaleString(this.state.locale, text)
  }
}
export default LocaleMixin
