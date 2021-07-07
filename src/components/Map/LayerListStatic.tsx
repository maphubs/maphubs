import React from 'react'
import LayerListItemStatic from './LayerListItemStatic'
import type { Layer } from '../../types/layer'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  layers: Layer[]
  toggleVisibility: (...args: Array<any>) => void
  t: (v: string | LocalizedString) => string
}
const LayerListStatic = ({
  layers,
  toggleVisibility,
  t
}: Props): JSX.Element => {
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
                  t={t}
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
