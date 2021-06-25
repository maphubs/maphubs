import React from 'react'
import LayerSettings from './LayerSettings'
import LayerActions from '../../actions/LayerActions'
import { notification, message, Row } from 'antd'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import type { Group } from '../../stores/GroupStore'
type Props = {
  groups: Array<Group>
  onSubmit: (...args: Array<any>) => any
}
type State = {} & LocaleStoreState & LayerStoreState
export default class Step2<Props, State> {
  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  onSubmit: any | (() => any | void) = () => {
    if (!this.state.is_external && !this.state.is_empty) {
      return this.saveDataLoad()
    } else if (this.state.is_empty) {
      return this.initEmptyLayer()
    } else {
      return this.saveExternal()
    }
  }
  initEmptyLayer: any | (() => void) = () => {
    const { t } = this

    const _this = this

    // save presets
    LayerActions.loadDefaultPresets()
    LayerActions.submitPresets(true, this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        LayerActions.initEmptyLayer(_this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
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
  saveDataLoad: any | (() => void) = () => {
    const { t } = this

    const _this = this

    const closeMessage = message.loading(t('Saving'), 0)
    // save presets
    LayerActions.submitPresets(false, this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
        closeMessage()
      } else {
        LayerActions.loadData(_this.state._csrf, (err) => {
          closeMessage()

          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
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
  saveExternal: any | (() => void) = () => {
    LayerActions.tileServiceInitialized()

    if (this.props.onSubmit) {
      this.props.onSubmit()
    }
  }

  render(): JSX.Element {
    const { t } = this
    return (
      <Row>
        <p>{t('Provide Information About the Data Layer')}</p>
        <LayerSettings
          groups={this.props.groups}
          submitText={t('Save and Continue')}
          onSubmit={this.onSubmit}
          warnIfUnsaved={false}
        />
      </Row>
    )
  }
}
