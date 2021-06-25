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
export default {
  getSource(
    type: string,
    mapConfig: Record<string, any>,
    t: (...args: Array<any>) => any
  ): string | Node {
    if (type === 'local') {
      return (
        <UploadLocalSource
          onSubmit={this.onSubmit}
          mapConfig={mapConfig}
          t={t}
        />
      )
    } else if (type === 'geojson') {
      return <GeoJSONUrlSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'mapbox') {
      return <MapboxSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'raster') {
      return <RasterTileSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'raster-upload') {
      return <UploadRasterSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'vector') {
      return <VectorTileSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'ags') {
      return <AGOLSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'planet') {
      return <PlanetLabsSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'sentinel') {
      return <SentinelSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'wms') {
      return <WMSSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'dgwms') {
      return <DGWMSSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'earthengine') {
      return <EarthEngineSource onSubmit={this.onSubmit} t={t} />
    } else if (type === 'remote') {
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
              <Button type='primary' href='/createremotelayer'>
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
    } else if (type === 'point' || type === 'line' || type === 'polygon') {
      return <EmptyLocalSource type={type} onSubmit={this.onSubmit} t={t} />
    } else {
      return ''
    }
  }
}
