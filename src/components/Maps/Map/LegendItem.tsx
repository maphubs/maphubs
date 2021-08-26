import React from 'react'
import Marker from './Marker'
import { Layer } from '../../../types/layer'
import { LocalizedString } from '../../../types/LocalizedString'
import mapboxgl from 'mapbox-gl'

const htmlEncode = (str: string): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type Props = {
  layer: Layer
  style: Record<string, any>
  t: (v: string | LocalizedString) => string
}
const LegendItem = ({ t, layer, style }: Props): JSX.Element => {
  if (layer === undefined) return <div />

  if (!layer || !layer.layer_id) {
    return <div />
  }

  const name = htmlEncode(t(layer.name))
  const source = htmlEncode(t(layer.source))
  let html = ''

  if (layer.legend_html) {
    html = layer.legend_html.replace(/{name}/i, name)
  }

  let legendItem = (
    <div style={style}>
      <span
        className='no-margin no-padding valign'
        dangerouslySetInnerHTML={{
          __html: html
        }}
      />
      <span
        className='right right-align truncate no-padding'
        style={{
          margin: 0,
          fontSize: '6px',
          lineHeight: '6px',
          position: 'absolute',
          bottom: 0,
          right: 0
        }}
      >
        {source}
      </span>
    </div>
  )
  const mapStyle = layer.style

  if (
    mapStyle &&
    mapStyle.layers &&
    Array.isArray(mapStyle.layers) &&
    mapStyle.layers.length > 0
  ) {
    const layers = mapStyle.layers as Array<
      mapboxgl.AnyLayer & { metadata: Record<string, unknown> }
    >
    for (const layer of layers) {
      if (
        layer.id.startsWith('omh-data-point') &&
        layer.metadata &&
        layer.metadata['maphubs:markers'] &&
        layer.metadata['maphubs:markers'].enabled
      ) {
        // clone object to avoid changing size of real markers
        const markerConfig = JSON.parse(
          JSON.stringify(layer.metadata['maphubs:markers'])
        )
        markerConfig.width = 18
        markerConfig.height = 18
        legendItem = (
          <div className='omh-legend valign-wrapper' style={style}>
            <div
              className='valign'
              style={{
                float: 'left'
              }}
            >
              <Marker {...markerConfig} />
            </div>
            <h3
              className='valign'
              style={{
                paddingLeft: '5px',
                paddingTop: '0px',
                paddingBottom: '5px'
              }}
            >
              {name}
            </h3>
            <span
              className='left left-align truncate no-padding'
              style={{
                margin: 0,
                fontSize: '6px',
                lineHeight: '6px',
                position: 'absolute',
                bottom: 0,
                right: 0
              }}
            >
              {source}
            </span>
          </div>
        )
      }
    }
  }

  return legendItem
}
LegendItem.defaultProps = {
  style: {
    padding: '2px',
    width: '100%',
    margin: 'auto',
    position: 'relative',
    minHeight: '25px',
    borderBottom: '1px solid #F1F1F1'
  }
}
export default LegendItem
