// @flow
import Reflux from 'reflux'
import Actions from '../actions/UserActions'
const request = require('superagent')
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('stores/user-store')
const checkClientError = require('../services/client-error-response').checkClientError

export type User = {
  id: number,
  email: string,
  display_name: string,
  picture?: string,
  groups: Array<Object>,
  admin?: boolean,
  coral_jwt?: string
}

export type UserStoreState = {
  user?: User
}

export default class UserStore extends Reflux.Store {
  constructor () {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState (): UserStoreState {
    return {
      user: undefined
    }
  }

  reset () {
    this.setState(this.getDefaultState())
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners
  login (user: string) {
    this.setState({user})
  }

  getUser (_csrf: string, cb: Function) {
    const _this = this
    request.post('/api/user/details/json')
      .type('json').accept('json')
      .send({_csrf})
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          if (err) {
            cb(err)
          } else {
            if (res.body.user) {
              _this.login(res.body.user)
              cb()
            } else {
              cb(JSON.stringify(res.body))
            }
          }
        })
      })
  }

  logout () {
    this.setState(this.getDefaultState())
    this.trigger(this.state)
    // Note the server side is handed by redirecting the user to the logout page
  }
}
