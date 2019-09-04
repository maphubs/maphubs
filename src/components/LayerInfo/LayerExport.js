//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
import slugify from 'slugify'

type Props = {
  layer: Object
}

export default class LayerExport extends MapHubsPureComponent<Props, void> {
  render () {
    const {t} = this
    const {layer} = this.props
    const name = slugify(t(layer.name))
    const layerId = layer.layer_id
    const maphubsFileURL = `/api/layer/${layerId}/export/maphubs/${name}.maphubs`
    const geoJSONURL = `/api/layer/${layerId}/export/json/${name}.geojson`
    const shpURL = `/api/layer/${layerId}/export/shp/${name}.zip`
    const kmlURL = `/api/layer/${layerId}/export/kml/${name}.kml`
    const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`
    const gpxURL = `/api/layer/${layerId}/export/gpx/${name}.gpx`
    const svgURL = `/api/layer/${layerId}/export/svg/${name}.svg`
    const geobufURL = `/api/layer/${layerId}/export/geobuf/${name}.pbf`

    if (!layer.disable_export) {
      return (
        <div>
          <ul className='collection with-header'>
            <li className='collection-header'><h5>{t('Export Layer')}</h5></li>
            <li className='collection-item'>{t('MapHubs Format:')} <a href={maphubsFileURL}>{maphubsFileURL}</a></li>
            {!layer.is_external &&
              <>
                <li className='collection-item'>{t('Shapefile:')} <a href={shpURL}>{shpURL}</a></li>
                <li className='collection-item'>{t('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></li>
                <li className='collection-item'>{t('KML:')} <a href={kmlURL}>{kmlURL}</a></li>
                <li className='collection-item'>{t('CSV:')} <a href={csvURL}>{csvURL}</a></li>
                <li className='collection-item'>{t('SVG:')} <a href={svgURL}>{svgURL}</a></li>
                <li className='collection-item'>{t('Geobuf:')} <a href={geobufURL}>{geobufURL}</a> (<a href='https://github.com/mapbox/geobuf'>{t('Learn More')}</a>)</li>
              </>}
            {(!layer.is_external && layer.data_type !== 'polygon') &&
              <li className='collection-item'>{t('GPX:')} <a href={gpxURL}>{gpxURL}</a></li>}
          </ul>
        </div>
      )
    } else {
      return (
        <div>
          <p>{t('Export is not available for this layer.')}</p>
        </div>
      )
    }
  }
}
