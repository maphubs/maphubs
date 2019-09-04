// @flow
import React from 'react'
import PresetForm from './PresetForm'
import LayerStore from '../../stores/layer-store'
import Actions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import type {MapHubsField} from '../../types/maphubs-field'
import type {LayerStoreState} from '../../stores/layer-store'

type Props = {
  onValid: Function,
  onInvalid: Function,
  warnIfUnsaved: boolean
}

type State = LayerStoreState;

export default class PresetEditor extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    warnIfUnsaved: true
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    const {t} = this
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingPresetChanges) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (nextState.presets && !this.state.presets) {
      return true
    }
    return !_isequal(nextState.presets, this.state.presets)
  }

  addPreset = () => {
    Actions.addPreset()
  }

  onValid = () => {
    if (this.props.onValid) this.props.onValid()
  }

  onInvalid = () => {
    if (this.props.onInvalid) this.props.onInvalid()
  }

  render () {
    const {t} = this
    const _this = this
    let presets = []
    if (this.state.presets) {
      presets = this.state.presets.toArray()
    }
    return (
      <div>
        <div className='row no-padding'>
          <div className='left'>
            <a className='waves-effect waves-light btn' onClick={this.addPreset}><i className='material-icons right'>add</i>{t('Add Field')}</a>
          </div>
        </div>
        <ul className='collection'>
          {
            presets.map((preset: MapHubsField) => {
              return (
                <li key={preset.id} className='collection-item attribute-collection-item'>
                  <PresetForm
                    ref={preset.tag} {...preset}
                    onValid={_this.onValid}
                    onInvalid={_this.onInvalid}
                  />
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
