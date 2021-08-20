import React from 'react'
import LayerListItemStatic from './LayerListItemStatic'
import type { Layer } from '../../../types/layer'
type Props = {
  layers: Layer[]
  toggleVisibility: (...args: Array<any>) => void
}
const LayerListStatic = ({ layers, toggleVisibility }: Props): JSX.Element => {
  return (
    <div
      style={{
        height: '100%',
        padding: 0,
        margin: 0,
        width: '200px'
      }}
    >
      <ul
        style={{
          height: '100%',
          overflow: 'auto'
        }}
        className='collection no-margin custom-scroll-bar'
      >
        {layers.map((layer) => {
          if (layer && layer.layer_id && layer.layer_id > 0) {
            return (
              <li key={layer.layer_id}>
                <LayerListItemStatic
                  item={layer}
                  toggleVisibility={toggleVisibility}
                />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}

export default LayerListStatic
