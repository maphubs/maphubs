import type { Element } from 'React'
import React from 'react'
import { notification } from 'antd'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
type Props = {
  onSubmit?: (...args: Array<any>) => any
}
type State = {
  pendingChanges: boolean
} & LocaleStoreState
export default class CreateLayerPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  createEmptyLayer: any | (() => void) = () => {
    const _this = this

    LayerActions.createLayer(this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: _this.t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.setState({
          pendingChanges: false
        })

        if (_this.props.onSubmit) {
          _this.props.onSubmit()
        }
      }
    })
  }

  render(): Element<'div'> {
    return <div />
  }
}
