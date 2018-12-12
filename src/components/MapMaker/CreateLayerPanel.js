// @flow
import React from 'react'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'
import MessageActions from '../../actions/MessageActions'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {|
  onSubmit?: Function
|}

type State = {
  pendingChanges: boolean
} & LocaleStoreState

export default class CreateLayerPanel extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  createEmptyLayer = () => {
    const _this = this
    LayerActions.createLayer(this.state._csrf, err => {
      if (err) {
        MessageActions.showMessage({title: _this.t('Error'), message: err})
      } else {
        _this.setState({pendingChanges: false})
        if (_this.props.onSubmit) {
          _this.props.onSubmit()
        }
      }
    })
  }

  render () {
    return (
      <div />
    )
  }
}
