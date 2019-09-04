// @flow
import React from 'react'
import { message, notification } from 'antd'
import LayerActions from '../../actions/LayerActions'
import CreateLayer from './CreateLayer'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {
  onSubmit: Function,
  mapConfig: Object
}

type State = {
  created: boolean,
  canSubmit: boolean,
  selectedSource: string,
  warnIfUnsaved: boolean
} & LocaleStoreState

export default class Step1 extends MapHubsComponent<Props, State> {
   props: Props

  state: State = {
    created: false,
    canSubmit: false,
    selectedSource: 'local',
    warnIfUnsaved: false
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  onSubmit = () => {
    this.props.onSubmit()
  }

  cancelCallback = () => {
    const {t} = this
    this.setState({warnIfUnsaved: false})
    message.info(t('Layer Cancelled'), 1, () => {
      window.location = '/layers'
    })
  }

   onCancel = () => {
     const {t} = this
     const _this = this
     if (_this.state.created) {
       // delete the layer
       LayerActions.cancelLayer(this.state._csrf, (err) => {
         if (err) {
           notification.error({
             message: t('Server Error'),
             description: err.message || err.toString() || err,
             duration: 0
           })
         } else {
           _this.cancelCallback()
         }
       })
     } else {
       _this.cancelCallback()
     }
   }

   render () {
     const {t} = this
     return (
       <div className='row'>
         <CreateLayer
           onSubmit={this.onSubmit}
           mapConfig={this.props.mapConfig}
           showCancel cancelText={t('Cancel')} onCancel={this.onCancel}
         />
       </div>
     )
   }
}
