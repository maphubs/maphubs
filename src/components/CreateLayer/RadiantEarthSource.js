// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import LayerActions from '../../actions/LayerActions'
import NotificationActions from '../../actions/NotificationActions'
import MessageActions from '../../actions/MessageActions'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'
import request from 'superagent'
import DebugService from '../../services/debug'

import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'

const debug = DebugService('RadiantEarthSource')

type Project = {
  id: string
}

type Props = {|
  onSubmit: Function
|}

type State = {
  refreshToken?: string,
  accessToken?: string,
  mapToken?: string,
  results?: Array<Object>,
  selectedResult?: Object
} & LocaleStoreState & LayerStoreState;

export default class RadiantEarthSource extends MapHubsComponent<Props, State> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.state = {}
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  getSessionToken = () => {
    const _this = this
    const {refreshToken} = this.state
    request.post('https://api.radiant.earth/platform/tokens')
      .type('json').accept('json')
      .send({
        refresh_token: refreshToken
      })
      .end((err, res) => {
        if (err) {
          debug.error(err)
          MessageActions.showMessage({title: 'Error', message: err})
        } else {
          const accessToken = res.body.access_token
          _this.setState({accessToken})
        }
      })
  }

  getProjects = () => {
    const _this = this
    const {accessToken} = this.state
    request.get('https://api.radiant.earth/platform/projects/')
      .set('authorization', 'Bearer ' + accessToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          debug.error(err)
          MessageActions.showMessage({title: 'Error', message: err})
        } else {
          const results = res.body.results
          _this.setState({results})
        }
      })
  }

  createMapToken = () => {
    const _this = this
    const {accessToken} = this.state
    request.get('https://api.radiant.earth/platform/map-tokens/')
      .set('authorization', 'Bearer ' + accessToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          debug.error(err)
          MessageActions.showMessage({title: 'Error', message: err})
        } else {
          const results = res.body.results
          _this.setState({results})
        }
      })
  }

  buildTileURL = () => {
    const {selectedResult} = this.state
    return `https://tiles.rasterfoundry.com/${selectedResult.id}/{z}/{x}/{y}/?tag=${tag}&mapToken=${mapToken}`
  }

  submit = (model: Object) => {
    const _this = this
    const layers = []

    const selectedIDs = model.selectedIDs

    const selectedIDArr = selectedIDs.split(',')

    selectedIDArr.forEach(selected => {
      const url = _this.getAPIUrl(selected)
      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      })
    })

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Planet',
      external_layer_config: {
        type: 'multiraster',
        layers
      }

    }, _this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Error'), message: err})
      } else {
        NotificationActions.showNotification({
          message: _this.__('Layer Saved'),
          dismissAfter: 1000,
          onDismiss () {
            // reset style to load correct source
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()
            _this.props.onSubmit()
          }
        })
      }
    })
  }

  optionChange = (value: string) => {
    this.setState({selectedOption: value})
  }

  sceneOptionChange = (value: string) => {
    this.setState({selectedSceneOption: value})
  }

  render () {
    return (
      <div className='row'>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>{this.__('Paste the selected IDs from the Planet Explorer API box')}</p>
            <div className='row'>
              <TextArea name='selectedIDs' label={this.__('Planet Explorer Selected IDs')}
                length={2000}
                icon='info' className='col s12'required />
            </div>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{this.__('Save and Continue')}</button>
          </div>
        </Formsy>
      </div>
    )
  }
}
