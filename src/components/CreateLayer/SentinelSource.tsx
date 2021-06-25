import React from 'react'
import { message, notification, Row } from 'antd'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onSubmit: (...args: Array<any>) => any
}
type State = {
  canSubmit: boolean
  selectedOption: string
  selectedSceneOption: string
} & LocaleStoreState &
  LayerStoreState
export default class SentinelSource extends React.Component<Props, State> {
  props: Props
  state: State = {
    canSubmit: false,
    selectedOption: 'scene',
    selectedSceneOption: 'ortho'
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }
  getAPIUrl: any | ((selected: string) => void) = (selected: string) => {
    // const selectedArr = selected.split(':')
    // const selectedType = selectedArr[0].trim()
    // const selectedScene = selectedArr[1].trim()
    // return url
  }
  submit: any | ((model: any) => void) = (model: Record<string, any>) => {
    const { t } = this

    const _this = this

    const layers = []
    const selectedIDs = model.selectedIDs
    const selectedIDArr = selectedIDs.split(',')
    selectedIDArr.forEach((selected) => {
      const url = _this.getAPIUrl(selected)

      layers.push({
        sentinel_secene: selected,
        tiles: [url]
      })
    })
    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'Sentinel',
        external_layer_config: {
          type: 'multiraster',
          layers
        }
      },
      _this.state._csrf,
      (err) => {
        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          message.success(t('Layer Saved'), 1, () => {
            // reset style to load correct source
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()

            _this.props.onSubmit()
          })
        }
      }
    )
  }
  optionChange: any | ((value: string) => void) = (value: string) => {
    this.setState({
      selectedOption: value
    })
  }
  sceneOptionChange: any | ((value: string) => void) = (value: string) => {
    this.setState({
      selectedSceneOption: value
    })
  }

  render(): JSX.Element {
    return (
      <Row>
        <p>Coming Soon!</p>
      </Row>
    )
  }
}
