import React from 'react'
import LayerStyle from './LayerStyle'
import LayerActions from '../../actions/LayerActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
type Props = {
  onSubmit: (...args: Array<any>) => any
  onPrev: (...args: Array<any>) => any
  mapConfig: Record<string, any>
}
type State = LocaleStoreState
export default class Step3<Props, State> {
  props: Props
  onSubmit: any | ((layer_id: number, name: string) => void) = (
    layer_id: number,
    name: string
  ) => {
    const _this = this

    LayerActions.setComplete(this.state._csrf, () => {
      if (_this.props.onSubmit) _this.props.onSubmit(layer_id, name)
    })
  }
  onPrev: any | (() => void) = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  render(): JSX.Element {
    return (
      <LayerStyle
        waitForTileInit
        mapConfig={this.props.mapConfig}
        onSubmit={this.onSubmit}
      />
    )
  }
}
