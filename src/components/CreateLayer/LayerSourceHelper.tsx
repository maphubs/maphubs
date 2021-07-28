import React from 'react'
import { Row, Col, Button } from 'antd'
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
import UploadRasterSource from './UploadRasterSource'
import { LocalizedString } from '../../types/LocalizedString'
export default {
  getSource(
    type: string,
    mapConfig: Record<string, any>,
    t: (v: string | LocalizedString) => string
  ): JSX.Element {
    switch (type) {
      case 'local': {
        return (
          <UploadLocalSource onSubmit={this.onSubmit} mapConfig={mapConfig} />
        )
      }
      case 'geojson': {
        return <GeoJSONUrlSource onSubmit={this.onSubmit} />
      }
      case 'mapbox': {
        return <MapboxSource onSubmit={this.onSubmit} />
      }
      case 'raster': {
        return <RasterTileSource onSubmit={this.onSubmit} />
      }
      case 'raster-upload': {
        return (
          <UploadRasterSource onSubmit={this.onSubmit} mapConfig={mapConfig} />
        )
      }
      case 'vector': {
        return <VectorTileSource onSubmit={this.onSubmit} />
      }
      case 'ags': {
        return <AGOLSource onSubmit={this.onSubmit} />
      }
      case 'planet': {
        return <PlanetLabsSource onSubmit={this.onSubmit} />
      }
      case 'sentinel': {
        return <SentinelSource onSubmit={this.onSubmit} />
      }
      case 'wms': {
        return <WMSSource onSubmit={this.onSubmit} />
      }
      case 'dgwms': {
        return <DGWMSSource onSubmit={this.onSubmit} />
      }
      case 'earthengine': {
        return <EarthEngineSource onSubmit={this.onSubmit} />
      }
      case 'remote': {
        return (
          <>
            <p
              style={{
                marginBottom: '20px'
              }}
            >
              {t(
                'Note: This will exit this page and take you to the import tool'
              )}
            </p>
            <Row
              justify='center'
              align='middle'
              style={{
                marginTop: '20px',
                textAlign: 'center'
              }}
            >
              <Col sm={24} md={12}>
                <Button type='primary' href='/create/remotelayer'>
                  {t('Link a Remote Layer')}
                </Button>
              </Col>
              <Col sm={24} md={12}>
                <Button type='primary' href='/import'>
                  {t('Import MapHubs File')}
                </Button>
              </Col>
            </Row>
          </>
        )
      }
      case 'point':
      case 'line':
      case 'polygon': {
        return <EmptyLocalSource type={type} onSubmit={this.onSubmit} />
      }
      default: {
        return ''
      }
    }
  }
}
