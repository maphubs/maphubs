import React from 'react'
import LayerSettings from './LayerSettings'
import LayerActions from '../../actions/LayerActions'
import { notification, message, Row } from 'antd'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
import type { Group } from '../../stores/GroupStore'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  groups: Array<Group>
  onSubmit: (...args: Array<any>) => any
  t: (v: string | LocalizedString) => string
}
type State = LocaleStoreState & LayerStoreState
export default class Step2 extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
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
    const { t, props, state } = this
    const { _csrf } = state
    const { onSubmit } = props

    // save presets
    LayerActions.loadDefaultPresets()
    LayerActions.submitPresets(true, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        LayerActions.initEmptyLayer(_csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            LayerActions.tileServiceInitialized()

            if (onSubmit) onSubmit()
          }
        })
      }
    })
  }
  saveDataLoad: any | (() => void) = () => {
    const { t, props, state } = this
    const { _csrf } = state
    const { onSubmit } = props

    const closeMessage = message.loading(t('Saving'), 0)
    // save presets
    LayerActions.submitPresets(false, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
        closeMessage()
      } else {
        LayerActions.loadData(_csrf, (err) => {
          closeMessage()

          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            LayerActions.tileServiceInitialized()

            if (onSubmit) onSubmit()
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
    const { t, groups } = this.props
    return (
      <Row>
        <p>{t('Provide Information About the Data Layer')}</p>
        <LayerSettings
          groups={groups}
          submitText={t('Save and Continue')}
          onSubmit={this.onSubmit}
          warnIfUnsaved={false}
        />
      </Row>
    )
  }
}
