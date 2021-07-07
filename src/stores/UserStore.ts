import Reflux from 'reflux'
import Actions from '../actions/UserActions'
import request from 'superagent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { checkClientError } from '../services/client-error-response'

const debug = DebugService('stores/user-store')

export type User = {
  id: number
  email: string
  display_name: string
  picture?: string
  groups: Array<Record<string, any>>
  admin?: boolean
  coral_jwt?: string
}
export type UserStoreState = {
  user?: User
}
export default class UserStore extends Reflux.Store {
  state: UserStoreState
  setState: any
  listenables: any
  trigger: any

  constructor() {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState(): UserStoreState {
    return {
      user: undefined
    }
  }

  reset(): void {
    this.setState(this.getDefaultState())
  }

  storeDidUpdate(): void {
    debug.log('store updated')
  }

  // listeners
  login(user: string): void {
    this.setState({
      user
    })
  }

  getUser(_csrf: string, cb: (...args: Array<any>) => any): void {
    const { login } = this

    request
      .post('/api/user/details/json')
      .type('json')
      .accept('json')
      .send({
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          if (err) {
            cb(err)
          } else {
            if (res.body.user) {
              login(res.body.user)

              cb()
            } else {
              cb(new Error(JSON.stringify(res.body)))
            }
          }
        })
      })
  }

  logout(): void {
    this.setState(this.getDefaultState())
    this.trigger(this.state) // Note the server side is handed by redirecting the user to the logout page
  }
}
