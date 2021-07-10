import React from 'react'
import { notification } from 'antd'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

type Props = {
  onSubmit?: (...args: Array<any>) => any
}
type State = {
  pendingChanges: boolean
}
export default class CreateLayerPanel extends React.Component<Props, State> {
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  createEmptyLayer = (): void => {
    const { t, props, state, setState } = this
    const { _csrf } = state
    const { onSubmit } = props

    LayerActions.createLayer(_csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setState({
          pendingChanges: false
        })

        if (onSubmit) onSubmit()
      }
    })
  }

  render(): JSX.Element {
    return <div />
  }
}
