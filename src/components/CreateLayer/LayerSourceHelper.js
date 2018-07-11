// @flow
import React from 'react'
import UploadLocalSource from './UploadLocalSource'
import EmptyLocalSource from './EmptyLocalSource'
import MapboxSource from './MapboxSource'
import RasterTileSource from './RasterTileSource'
import VectorTileSource from './VectorTileSource'
import GeoJSONUrlSource from './GeoJSONUrlSource'
import AGOLSource from './AGOLSource'
import PlanetLabsSource from './PlanetLabsSource'
import SentinelSource from './SentinelSource'
import WMSSource from './WMSSource'
import DGWMSSource from './DGWMSSource'
import EarthEngineSource from './EarthEngineSource'

export default {

  getSource (type: string, mapConfig: Object) {
    if (type === 'local') {
      return (<UploadLocalSource onSubmit={this.onSubmit} mapConfig={mapConfig} />)
    } else if (type === 'geojson') {
      return (<GeoJSONUrlSource onSubmit={this.onSubmit} />)
    } else if (type === 'mapbox') {
      return (<MapboxSource onSubmit={this.onSubmit} />)
    } else if (type === 'raster') {
      return (<RasterTileSource onSubmit={this.onSubmit} />)
    } else if (type === 'vector') {
      return (<VectorTileSource onSubmit={this.onSubmit} />)
    } else if (type === 'ags') {
      return (<AGOLSource onSubmit={this.onSubmit} />)
    } else if (type === 'planet') {
      return (<PlanetLabsSource onSubmit={this.onSubmit} />)
    } else if (type === 'sentinel') {
      return (<SentinelSource onSubmit={this.onSubmit} />)
    } else if (type === 'wms') {
      return (<WMSSource onSubmit={this.onSubmit} />)
    } else if (type === 'dgwms') {
      return (<DGWMSSource onSubmit={this.onSubmit} />)
    } else if (type === 'earthengine') {
      return (<EarthEngineSource onSubmit={this.onSubmit} />)
    } else if (type === 'remote') {
      return (
        <div style={{marginTop: '20px'}}>
          <div className='col s12 m6'>
            <a className='btn' href='/createremotelayer'>{this.__('Link a Remote Layer')}</a>
          </div>
          <div className='col s12 m6'>
            <a className='btn' href='/importlayer'>{this.__('Import MapHubs File')}</a>
          </div>
        </div>
      )
    } else if (type === 'point' || type === 'line' || type === 'polygon') {
      return (<EmptyLocalSource type={type} onSubmit={this.onSubmit} />)
    } else {
      return ''
    }
  }
}
