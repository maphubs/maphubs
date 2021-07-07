import React from 'react'
import { message, notification, Row } from 'antd'
import LayerActions from '../../actions/LayerActions'
import CreateLayer from './CreateLayer'

import type { LocaleStoreState } from '../../stores/LocaleStore'
type Props = {
  onSubmit: (...args: Array<any>) => any
  mapConfig: Record<string, any>
}
type State = {
  created: boolean
  canSubmit: boolean
  selectedSource: string
  warnIfUnsaved: boolean
} & LocaleStoreState
export default class Step1 extends React.Component<Props, State> {
  props: Props
  state: State = {
    created: false,
    canSubmit: false,
    selectedSource: 'local',
    warnIfUnsaved: false
  }
  sourceChange: any | ((value: string) => void) = (value: string) => {
    this.setState({
      selectedSource: value
    })
  }
  onSubmit: any | (() => void) = () => {
    this.props.onSubmit()
  }
  cancelCallback: any | (() => void) = () => {
    const { t } = this
    this.setState({
      warnIfUnsaved: false
    })
    message.info(t('Layer Cancelled'), 1, () => {
      window.location.assign('/layers')
    })
  }
  onCancel: any | (() => void) = () => {
    const { t } = this

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

  render(): JSX.Element {
    const { t } = this
    return (
      <Row>
        <CreateLayer
          onSubmit={this.onSubmit}
          mapConfig={this.props.mapConfig}
          showCancel
          cancelText={t('Cancel')}
          onCancel={this.onCancel}
        />
      </Row>
    )
  }
}
