// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'

import type {MapHubsField} from '../../types/maphubs-field'

type Props = {
  data: Object,
  presets: Array<MapHubsField>
}

export default class FeatureProps extends MapHubsComponent<Props, void> {
  props: Props

  render () {
    const _this = this
    let tbody = ''
    if (this.props.presets && this.props.data) {
      tbody = (
        <tbody>
          {
            this.props.presets.map((preset, i) => {
              const val = this.props.data[preset.tag]
              return (
                <tr key={`feature-attrib-${i}`}>
                  <td>{_this._o_(preset.label)}</td>
                  <td>{val}</td>
                </tr>
              )
            })
          }
        </tbody>
      )
    } else if (this.props.data) {
      tbody = (
        <tbody>
          {
            Object.keys(this.props.data).map((key, i) => {
              const val = this.props.data[key]
              return (
                <tr key={`feature-attrib-${i}`}>
                  <td>{key}</td>
                  <td>{val}</td>
                </tr>
              )
            })
          }
        </tbody>
      )
    }

    return (
      <table>
        <thead>
          <tr>
            <th>{this.__('Tag')}</th>
            <th>{this.__('Value')}</th>
          </tr>
        </thead>
        {tbody}
      </table>

    )
  }
}
