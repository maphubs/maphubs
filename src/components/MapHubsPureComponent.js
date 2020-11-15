// @flow
import Reflux from 'reflux'
import Locales from '../services/locales'
import LocaleStore from '../stores/LocaleStore'
export default class MapHubsComponent<Props, State> extends Reflux.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.stores = [LocaleStore]
  }

  t: ((val: any) => any | string) = (val: any) => {
    return this.__(val)
  }

  __: ((val: any) => any | string) = (val: any) => {
    if (typeof val === 'string') {
      if (this.state.locale) {
        return Locales.getLocaleString(this.state.locale, val)
      } else {
        return val
      }
    } else {
      return Locales.getLocaleStringObject(this.state.locale, val)
    }
  }

  _o_: ((localizedString: LocalizedString) => any | string) = (localizedString: LocalizedString) => {
    if (this.state.locale && localizedString[this.state.locale]) {
      return localizedString[this.state.locale]
    } else if (localizedString.en) {
      return localizedString.en
    } else {
      return ''
    }
  }
}
