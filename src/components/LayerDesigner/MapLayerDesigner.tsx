import React, { useState } from 'react'
import LayerDesigner from './LayerDesigner'
import OpacityChooser from './OpacityChooser'
import MapStyles from '../Maps/Map/Styles'
import useT from '../../hooks/useT'
import type { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'
import { Labels } from './LabelSettings'

type Props = {
  layer: Layer
  onStyleChange: (
    layer_id: number,
    style: mapboxgl.Style,
    labels: Labels,
    legend_html: string
  ) => void
}
type State = {
  rasterOpacity: number
}
const MapLayerDesigner = ({ layer, onStyleChange }: Props): JSX.Element => {
  const { t } = useT()
  const [rasterOpacity, setRasterOpacity] = useState(100) // FIXME: opacity slider always starts at 100

  const updateOpacity = (opacity: number) => {
    const { layer_id, shortid, labels, legend_html, external_layer_config } =
      layer

    const elc = external_layer_config

    const style =
      elc && elc.type === 'multiraster'
        ? MapStyles.raster.multiRasterStyleWithOpacity(
            layer_id,
            shortid,
            elc.layers,
            opacity,
            'raster'
          )
        : MapStyles.raster.rasterStyleWithOpacity(
            layer_id,
            shortid,
            elc,
            opacity
          )

    onStyleChange(layer_id, style, labels, legend_html)
    setRasterOpacity(opacity)
  }
  const onColorChange = (style: mapboxgl.Style, legend: string): void => {
    const { layer_id, labels } = layer
    onStyleChange(layer_id, style, labels, legend)
  }

  const setStyle = (style: mapboxgl.Style): void => {
    const { layer_id, labels, legend_html } = layer
    onStyleChange(layer_id, style, labels, legend_html)
  }

  const setLabels = (style: mapboxgl.Style, labels: Labels): void => {
    onStyleChange(layer.layer_id, style, labels, layer.legend_html)
  }
  const setMarkers = (style: mapboxgl.Style): void => {
    onStyleChange(layer.layer_id, style, layer.labels, layer.legend_html)
  }
  const setLegend = (legend: string): void => {
    onStyleChange(layer.layer_id, layer.style, layer.labels, legend)
  }

  const { style, legend_html, is_external, external_layer_config, labels } =
    layer
  const legendCode: string = legend_html || ''
  const elc = external_layer_config
  let designer

  if (
    is_external &&
    elc &&
    (elc.type === 'raster' ||
      elc.type === 'multiraster' ||
      elc.type === 'ags-mapserver-tiles')
  ) {
    designer = (
      <div
        style={{
          padding: '5px'
        }}
      >
        <OpacityChooser
          value={rasterOpacity}
          onChange={updateOpacity}
          style={style}
          onStyleChange={setStyle}
          onColorChange={onColorChange}
          layer={layer}
          legendCode={legendCode}
          onLegendChange={setLegend}
          showAdvanced
        />
      </div>
    )
  } else if (is_external && elc && elc.type === 'mapbox-style') {
    designer = (
      <div
        style={{
          marginTop: '20px',
          marginBottom: '20px',
          padding: '20px',
          border: '1px solid #b1b1b1'
        }}
      >
        <p>{t('Unable to change this layer')}</p>
      </div>
    )
  } else {
    designer = (
      <LayerDesigner
        onColorChange={onColorChange}
        initialStyle={style}
        onStyleChange={setStyle}
        labels={labels}
        onLabelsChange={setLabels}
        onMarkersChange={setMarkers}
        layer={layer}
        legend={legendCode}
        onLegendChange={setLegend}
      />
    )
  }

  return <>{designer}</>
}
export default MapLayerDesigner
