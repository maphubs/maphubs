import Reflux from 'reflux'
import Actions from '../actions/LocaleActions'
import request from 'superagent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { checkClientError } from '../services/client-error-response'

const debug = DebugService('stores/local-store')

// var _assignIn = require('lodash.assignin');
export type LocaleStoreState = {
  locale?: string
}

export default class LocaleStore extends Reflux.Store {
  state: LocaleStoreState
  constructor() {
    super()
    this.state = {
      locale: 'en'
    }
    this.listenables = Actions
  }

  reset(): void {
    this.setState({
      locale: 'en'
    })
  }

  storeDidUpdate(): void {
    debug.log('store updated')
  }

  // listeners
  changeLocale(locale: string): void {
    const { state, setState, trigger } = this

    // tell the server so the preference can be saved in the user session
    // this allows the react isomorphic rendering to render the correct langauge on the server
    request
      .post('/api/user/setlocale')
      .type('json')
      .accept('json')
      .send({
        locale
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          (err) => {
            if (err) {
              debug.error(err)
            } else {
              debug.log('changed locale to: ' + locale)

              setState({
                locale
              })

              trigger(state)
            }
          },
          (cb) => {
            cb()
          }
        )
      })
  }
}
