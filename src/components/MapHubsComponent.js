// @flow
import Reflux from 'reflux'
import Locales from '../services/locales'
import LocaleStore from '../stores/LocaleStore'

export default class MapHubsComponent<P, S> extends Reflux.Component<P, S> {
  props: P
  state: S

  constructor (props: P) {
    super(props)
    this.stores = [LocaleStore]
  }

  componentWillMount () {
    super.componentWillMount()
  }

  __ = (text: string) => {
    if (this.state.locale) {
      return Locales.getLocaleString(this.state.locale, text)
    } else {
      return text
    }
  }

   _o_ = (localizedString: ?LocalizedString) => {
     return Locales.getLocaleStringObject(this.state.locale, localizedString)
   }
}
