// @flow
import React from 'react'
import NotificationActions from '../../actions/NotificationActions'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
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
    this.setState({warnIfUnsaved: false})
    NotificationActions.showNotification({
      message: this.__('Layer Cancelled'),
      onDismiss () {
        window.location = '/layers'
      }
    })
  }

   onCancel = () => {
     const _this = this
     if (_this.state.created) {
       // delete the layer
       LayerActions.cancelLayer(this.state._csrf, (err) => {
         if (err) {
           MessageActions.showMessage({title: _this.__('Error'), message: err})
         } else {
           _this.cancelCallback()
         }
       })
     } else {
       _this.cancelCallback()
     }
   }

   render () {
     return (
       <div className='row'>
         <CreateLayer onSubmit={this.onSubmit}
           mapConfig={this.props.mapConfig}
           showCancel cancelText={this.__('Cancel')} onCancel={this.onCancel}
         />
       </div>
     )
   }
}
