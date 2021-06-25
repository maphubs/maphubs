import Reflux from 'reflux'
import Locales from '../services/locales'
import LocaleStore from '../stores/LocaleStore'
export default class MapHubsComponent<P, S> extends Reflux.Component<P, S> {
  props: P
  state: S

  constructor(props: P) {
    super(props)
    this.stores = [LocaleStore]
  }

  t: (val: any) => any | string = (val: any) => {
    return this.__(val)
  }
  __: (val: any) => any | string = (val: any) => {
    if (typeof val === 'string') {
      if (this.state && this.state.locale) {
        return Locales.getLocaleString(this.state.locale, val)
      } else {
        return val
      }
    } else {
      return Locales.getLocaleStringObject(this.state.locale, val)
    }
  }
  _o_: (localizedString: LocalizedString | null | undefined) => any = (
    localizedString: LocalizedString | null | undefined
  ) => {
    return Locales.getLocaleStringObject(this.state.locale, localizedString)
  }
}