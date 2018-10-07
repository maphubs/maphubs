import React from 'react'
import Reflux from '../components/Rehydrate'
import Locales from '../services/locales'
import LocaleStore from '../stores/LocaleStore'

export type T = {
  t: Function
}

function withLocale (WrappedComponent) {
  return class extends Reflux.Component {
    constructor (props) {
      super(props)
      this.stores = [LocaleStore]
    }

    translate = (text: string) => {
      if (this.state.locale) {
        return Locales.getLocaleString(this.state.locale, text)
      } else {
        return text
      }
    }

     t = (localizedString: ?LocalizedString) => {
       if (typeof localizedString === 'string') {
         return this.translate(localizedString)
       } else {
         return Locales.getLocaleStringObject(this.state.locale, localizedString)
       }
     }

     render () {
       return <WrappedComponent {...this.props} t={this.t} />
     }
  }
}

export default withLocale
