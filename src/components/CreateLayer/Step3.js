// @flow
import type {Node} from "React";import React from 'react'
import LayerStyle from './LayerStyle'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'

type Props = {|
  onSubmit: Function,
  onPrev: Function,
  mapConfig: Object
|}

type State = LocaleStoreState

export default class Step3 extends MapHubsComponent<Props, State> {
  props: Props

  onSubmit: any | ((layer_id: number, name: string) => void) = (layer_id: number, name: string) => {
    const _this = this
    LayerActions.setComplete(this.state._csrf, () => {
      if (_this.props.onSubmit) _this.props.onSubmit(layer_id, name)
    })
  }

  onPrev: any | (() => void) = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  render (): Node {
    return (
      <LayerStyle
        waitForTileInit
        mapConfig={this.props.mapConfig}
        onSubmit={this.onSubmit}
      />
    )
  }
}
