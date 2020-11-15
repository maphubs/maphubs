//  @flow
import type {Node} from "React";import React from 'react'
import { Row, Card, List, Select } from 'antd'
import slugify from 'slugify'
import type {Layer} from '../../types/layer'

const {Option} = Select

type Props = {
  layer: Layer,
  t: Function
}

type State = {
  aggFields?: Array<string>
}

export default class LayerExport extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  handleAggregateChange: ((aggFields: Array<string>) => void) = (aggFields: Array<string>) => {
    this.setState({aggFields})
  }

  render (): Node {
    const {handleAggregateChange} = this
    const {layer, t} = this.props
    const {aggFields} = this.state
    const name = slugify(t(layer.name))
    const layerId = Number(layer.layer_id).toString()
    const maphubsFileURL = `/api/layer/${layerId}/export/maphubs/${name}.maphubs`
    const geoJSONURL = `/api/layer/${layerId}/export/json/${name}.geojson`
    const shpURL = `/api/layer/${layerId}/export/shp/${name}.zip`
    const kmlURL = `/api/layer/${layerId}/export/kml/${name}.kml`
    const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`
    const gpxURL = `/api/layer/${layerId}/export/gpx/${name}.gpx`
    const svgURL = `/api/layer/${layerId}/export/svg/${name}.svg`
    const geobufURL = `/api/layer/${layerId}/export/geobuf/${name}.pbf`

    let aggURLQuery
    if (aggFields) {
      aggURLQuery = `?agg=${aggFields.toString()}`
    }

    if (!layer.disable_export) {
      return (
        <>
          <Row>
            <Card size='small' title={t('Full Data')} style={{width: '100%'}} bodyStyle={{padding: '10px', width: '100%'}}>
              <List size='small'>
                <List.Item>{t('MapHubs Format:')} <a href={maphubsFileURL}>{maphubsFileURL}</a></List.Item>
                {!layer.is_external &&
                  <>
                    <List.Item>{t('Shapefile:')} <a href={shpURL}>{shpURL}</a></List.Item>
                    <List.Item>{t('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></List.Item>
                    <List.Item>{t('KML:')} <a href={kmlURL}>{kmlURL}</a></List.Item>
                    <List.Item>{t('CSV:')} <a href={csvURL}>{csvURL}</a></List.Item>
                    <List.Item>{t('SVG:')} <a href={svgURL}>{svgURL}</a></List.Item>
                    <List.Item>{t('Geobuf:')} <a href={geobufURL}>{geobufURL}</a> (<a href='https://github.com/mapbox/geobuf'>{t('Learn More')}</a>)</List.Item>
                  </>}
                {(!layer.is_external && layer.data_type !== 'polygon') &&
                  <List.Item>{t('GPX:')} <a href={gpxURL}>{gpxURL}</a></List.Item>}
              </List>
            </Card>
          </Row>
          <Row>
            <Card size='small' title={t('Aggregate Tool')} bodyStyle={{padding: '10px'}}>
              <Select
                mode='multiple'
                style={{ width: '100%' }}
                placeholder={t('Select Aggregate Fields')}
                defaultValue={[]}
                onChange={handleAggregateChange}
              >
                {layer.presets && layer.presets.map(preset => {
                  return (<Option key={preset.tag}>{preset.tag}</Option>)
                })}
              </Select>
              <List size='small'>
                {(!layer.is_external && aggURLQuery) &&
                  <>
                    <List.Item>{t('Shapefile:')} <a href={shpURL + aggURLQuery}>{shpURL + aggURLQuery}</a></List.Item>
                    <List.Item>{t('GeoJSON:')} <a href={geoJSONURL + aggURLQuery}>{geoJSONURL + aggURLQuery}</a></List.Item>
                    <List.Item>{t('KML:')} <a href={kmlURL + aggURLQuery}>{kmlURL + aggURLQuery}</a></List.Item>
                    <List.Item>{t('CSV:')} <a href={csvURL + aggURLQuery}>{csvURL + aggURLQuery}</a></List.Item>
                  </>}
                {
                  !aggURLQuery &&
                    <p style={{marginTop: '20px'}}>{t('This tool will aggregate features into Multi(Point/Line/Polygon)s grouped using the unique combination of the selected fields. Other fields will be combined into comma-delimited lists of their unique values.')}</p>
                }
              </List>
            </Card>
          </Row>
        </>
      )
    } else {
      return (
        <Row>
          <p>{t('Export is not available for this layer.')}</p>
        </Row>
      )
    }
  }
}
