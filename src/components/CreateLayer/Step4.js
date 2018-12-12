// @flow
import React from 'react'
import classNames from 'classnames'
import PresetEditor from './PresetEditor'
import MessageActions from '../../actions/MessageActions'
import Progress from '../Progress'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'

import $ from 'jquery'

type Props = {|
  onSubmit: Function,
  active: boolean,
  showPrev: boolean,
  onPrev: Function
|}

type DefaultProps = {
  active: boolean
}

type Step4State = {
  canSubmit: boolean,
  saving: boolean
}

type State = LocaleStoreState & LayerStoreState & Step4State

export default class Step4 extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    active: false
  }

  state: State = {
    canSubmit: false,
    saving: false,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  save = () => {
    $('body').scrollTop(0)
    if (!this.state.is_external) {
      return this.saveDataLoad()
    } else {
      return this.saveExternal()
    }
  }

  saveExternal = () => {
    this.props.onSubmit()
  }

  saveDataLoad = () => {
    const {t} = this
    const _this = this

    this.setState({saving: true})
    // save presets
    LayerActions.submitPresets(true, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
        _this.setState({saving: false})
      } else {
        LayerActions.loadData(_this.state._csrf, (err) => {
          _this.setState({saving: false})
          if (err) {
            MessageActions.showMessage({title: t('Error'), message: err})
          } else {
            LayerActions.tileServiceInitialized()
            if (_this.props.onSubmit) {
              _this.props.onSubmit()
            }
          }
        })
      }
    })
  }

  onPrev = () => {
    if (this.props.onPrev) this.props.onPrev()
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

  render () {
    const {t} = this
    // hide if not active
    let className = classNames('container')
    if (!this.props.active) {
      className = classNames('container', 'hidden')
    }

    let prevButton = ''
    if (this.props.showPrev) {
      prevButton = (
        <div className='left'>
          <a className='waves-effect waves-light btn' onClick={this.onPrev}><i className='material-icons left'>arrow_back</i>{t('Previous Step')}</a>
        </div>
      )
    }
    let presetEditor = ''
    if (!this.state.is_external) {
      presetEditor = (
        <div>
          <h5>Data Fields</h5>
          <div className='right'>
            <button onClick={this.save} className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
          </div>
          <PresetEditor onValid={this.enableButton} onInvalid={this.disableButton} />
        </div>
      )
    } else {
      presetEditor = (
        <h5 style={{margin: '20px'}}>{t('Unable to modify fields from external data sources, please continue to next step.')}</h5>
      )
    }
    return (
      <div className={className}>
        <Progress id='load-data-progess' title={t('Loading Data')} subTitle={t('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving} />
        {presetEditor}
        {prevButton}
        <div className='right'>
          <button onClick={this.save} className='waves-effect waves-light btn' disabled={!this.state.is_external && !this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
        </div>
      </div>
    )
  }
}
