// @flow
import type {Element} from "React";import React from 'react'
import MapHubsComponent from '../MapHubsComponent'

import type {MapHubsField} from '../../types/maphubs-field'

type Props = {
  data: Object,
  presets: Array<MapHubsField>
}

export default class FeatureProps extends MapHubsComponent<Props, void> {
  props: Props

  render (): void | Element<"ul"> {
    const _this = this
    if (this.props.presets && this.props.data) {
      return (
        <ul>
          {
            this.props.presets.map((preset, i) => {
              const val = this.props.data[preset.tag]
              return (
                <li key={`feature-attrib-${i}`} style={{padding: 5, lineHeight: '14px'}} className='collection-item attribute-collection-item'>
                  <p style={{color: 'rgb(158, 158, 158)', fontSize: '12px'}}>{_this.t(preset.label)}</p>
                  <p className='word-wrap' style={{fontSize: '14px'}}>
                    {val}
                  </p>
                </li>
              )
            })
          }
        </ul>
      )
    } else if (this.props.data) {
      return (
        <ul>
          {
            Object.keys(this.props.data).map((key, i) => {
              const val = this.props.data[key]
              return (
                <li key={`feature-attrib-${i}`} style={{padding: 5, lineHeight: '14px'}} className='collection-item attribute-collection-item'>
                  <p style={{color: 'rgb(158, 158, 158)', fontSize: '12px'}}>{key}</p>
                  <p className='word-wrap' style={{fontSize: '14px'}}>
                    {val}
                  </p>
                </li>
              )
            })
          }
        </ul>
      )
    }
  }
}
