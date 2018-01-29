// @flow
import Reflux from 'reflux'
import Actions from '../actions/LocaleActions'
const request = require('superagent')
const debug = require('../services/debug')('stores/local-store')
const checkClientError = require('../services/client-error-response').checkClientError
// var _assignIn = require('lodash.assignin');

export type LocaleStoreState = {
  locale?: string,
  _csrf?: string
}

export default class LocaleStore extends Reflux.Store {
  constructor () {
    super()
    this.state = {
      locale: 'en',
      _csrf: null
    }
    this.listenables = Actions
  }

  reset () {
    this.setState({
      locale: 'en',
      _csrf: null
    })
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners

  changeLocale (locale: string) {
    const _this = this
    // tell the server so the preference can be saved in the user session
    // this allows the react isomorphic rendering to render the correct langauge on the server
    request.post('/api/user/setlocale')
      .type('json').accept('json')
      .send({
        locale
      })
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            debug.error(err)
          } else {
            debug.log('changed locale to: ' + locale)
            _this.setState({locale})
            _this.trigger(_this.state)
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }
}
