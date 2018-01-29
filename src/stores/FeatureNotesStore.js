import Reflux from 'reflux'
import Actions from '../actions/FeatureNotesActions'
const request = require('superagent')
const debug = require('../services/debug')('stores/hub-store')
const checkClientError = require('../services/client-error-response').checkClientError

export type FeatureNotesStoreState = {
  notes?: string,
  unsavedChanges: boolean,
  saving: boolean
}

export default class FeatureNotesStore extends Reflux.Store {
  state: FeatureNotesStoreState

  constructor () {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState (): FeatureNotesStoreState {
    return {
      notes: null,
      unsavedChanges: false,
      saving: false
    }
  }

  reset () {
    this.setState(this.getDefaultState())
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners
  saveNotes (layer_id, mhid, _csrf, cb) {
    debug.log('save feature notes')
    const _this = this
    this.setState({saving: true})
    request.post('/api/feature/notes/save')
      .type('json').accept('json')
      .send({
        layer_id,
        mhid,
        notes: this.state.notes,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.setState({saving: false})
          cb(null)
        })
      })
  }

  setNotes (notes) {
    const state = this.state
    state.notes = notes
    state.unsavedChanges = true
    this.setState(state)
  }
}
