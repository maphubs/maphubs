import React from 'react'

import type { MapHubsField } from '../../types/maphubs-field'
type Props = {
  data: Record<string, any>
  presets: Array<MapHubsField>
  t: any
}
const FeatureProps = ({ data, presets, t }: Props): JSX.Element => {
  if (presets && data) {
    return (
      <ul>
        {presets.map((preset, i) => {
          const val = data[preset.tag]
          return (
            <li
              key={`feature-attrib-${i}`}
              style={{
                padding: 5,
                lineHeight: '14px'
              }}
              className='collection-item attribute-collection-item'
            >
              <p
                style={{
                  color: 'rgb(158, 158, 158)',
                  fontSize: '12px'
                }}
              >
                {t(preset.label)}
              </p>
              <p
                className='word-wrap'
                style={{
                  fontSize: '14px'
                }}
              >
                {val}
              </p>
            </li>
          )
        })}
      </ul>
    )
  } else if (data) {
    return (
      <ul>
        {Object.keys(data).map((key, i) => {
          const val = data[key]
          return (
            <li
              key={`feature-attrib-${i}`}
              style={{
                padding: 5,
                lineHeight: '14px'
              }}
              className='collection-item attribute-collection-item'
            >
              <p
                style={{
                  color: 'rgb(158, 158, 158)',
                  fontSize: '12px'
                }}
              >
                {key}
              </p>
              <p
                className='word-wrap'
                style={{
                  fontSize: '14px'
                }}
              >
                {val}
              </p>
            </li>
          )
        })}
      </ul>
    )
  }
}
export default FeatureProps
