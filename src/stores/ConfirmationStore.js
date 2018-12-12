// @flow
import Reflux from 'reflux'
import Actions from '../actions/ConfirmationActions'
import LocaleActions from '../actions/LocaleActions'
import Locales from '../services/locales'
const debug = require('../services/debug')('stores/confirmation-store')
const $ = require('jquery')

export type ConfirmationStoreState = {
  show: boolean,
  locale: string,
  title: string,
  message: string,
  postitiveButtonText: string,
  negativeButtonText: string,
  onPositiveResponse: Function,
  onNegativeResponse: Function
}

export default class ConfirmationStore extends Reflux.Store {
  state: ConfirmationStoreState

  constructor () {
    super()
    this.state = this.getEmptyState()
    this.listenables = Actions
    this.listenTo(LocaleActions.changeLocale, this.updateLocale)
  }

  t (text: string) {
    let locale = 'en'
    if (this.state && this.state.locale) {
      locale = this.state.locale
    }
    return Locales.getLocaleString(locale, text)
  }

  getEmptyState (): ConfirmationStoreState {
    return {
      show: false,
      locale: 'en',
      title: this.t('Confirmation'),
      message: this.t('Please confirm'),
      postitiveButtonText: this.t('Okay'),
      negativeButtonText: this.t('Cancel'),
      onPositiveResponse () {},
      onNegativeResponse () {}
    }
  }

  reset () {
    this.setState(this.getEmptyState())
  }

  updateLocale (locale: string) {
    this.setState({locale})
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners
  showConfirmation (options: Object) {
    if (options) {
      const updatedState = $.extend(this.getEmptyState(), options)
      this.setState(updatedState)
      this.setState({
        show: true
      })
    }
  }
}
