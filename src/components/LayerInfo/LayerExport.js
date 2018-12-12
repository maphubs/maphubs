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
    if (this.props.layer.is_external) {
      return (
        <div>
          <p>{t('This is an external data layer. For exports please see the data source at:')} {this.t(this.props.layer.source)}</p>
        </div>
      )
    } else {
      const name = slugify(this.t(this.props.layer.name))
      const layerId = this.props.layer.layer_id

      const maphubsFileURL = `/api/layer/${layerId}/export/maphubs/${name}.maphubs`
      const geoJSONURL = `/api/layer/${layerId}/export/json/${name}.geojson`
      const shpURL = `/api/layer/${layerId}/export/shp/${name}.zip`
      const kmlURL = `/api/layer/${layerId}/export/kml/${name}.kml`
      const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`
      const gpxURL = `/api/layer/${layerId}/export/gpx/${name}.gpx`
      const svgURL = `/api/layer/${layerId}/export/svg/${name}.svg`
      const geobufURL = `/api/layer/${layerId}/export/geobuf/${name}.pbf`

      if (!this.props.layer.disable_export) {
        let gpxExport = ''
        if (this.props.layer.data_type !== 'polygon') {
          gpxExport = (
            <li className='collection-item'>{t('GPX:')} <a href={gpxURL}>{gpxURL}</a></li>
          )
        }
        return (
          <div>
            <ul className='collection with-header'>
              <li className='collection-header'><h5>{t('Export Data')}</h5></li>
              <li className='collection-item'>{t('MapHubs Format:')} <a href={maphubsFileURL}>{maphubsFileURL}</a></li>
              <li className='collection-item'>{t('Shapefile:')} <a href={shpURL}>{shpURL}</a></li>
              <li className='collection-item'>{t('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></li>
              <li className='collection-item'>{t('KML:')} <a href={kmlURL}>{kmlURL}</a></li>
              <li className='collection-item'>{t('CSV:')} <a href={csvURL}>{csvURL}</a></li>
              <li className='collection-item'>{t('SVG:')} <a href={svgURL}>{svgURL}</a></li>
              <li className='collection-item'>{t('Geobuf:')} <a href={geobufURL}>{geobufURL}</a> (<a href='https://github.com/mapbox/geobuf'>{t('Learn More')}</a>)</li>
              {gpxExport}
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
}
