import Reflux from 'reflux'
import Locales from '../services/locales'
import LocaleStore from '../stores/LocaleStore'
export default class MapHubsComponent extends Reflux.Component {
  constructor(props) {
    super(props)
    this.stores = [LocaleStore]
    this.state = {
      locale: props.locale,
      _csrf: props._csrf
    }
  }

  __(text) {
    return Locales.getLocaleString(this.state.locale, text)
  }
}