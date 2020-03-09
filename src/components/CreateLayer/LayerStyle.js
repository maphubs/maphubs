// @flow
import React from 'react'
import { notification, Modal, message, Row, Col, Button } from 'antd'
import MapStyles from '../Map/Styles'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import OpacityChooser from '../LayerDesigner/OpacityChooser'
import LayerDesigner from '../LayerDesigner/LayerDesigner'
import MapHubsComponent from '../MapHubsComponent'
import { Subscribe } from 'unstated'
import MapContainer from '../Map/containers/MapContainer'
import type {LayerStoreState} from '../../stores/layer-store'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {GLStyle} from '../../types/mapbox-gl-style'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { confirm } = Modal

type Props = {|
  onSubmit: Function,
  showPrev?: boolean,
  prevText?: string,
  onPrev?: Function,
  mapConfig: Object,
  waitForTileInit: boolean
|}

type State = {
  rasterOpacity: number
} & LayerStoreState & LocaleStoreState

export default class LayerStyle extends MapHubsComponent<Props, State> {
  static defaultProps = {
    waitForTileInit: false // wait for tile service before showing map
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.state = {
      rasterOpacity: 100
    }
  }

  onSubmit = (MapState: Object) => {
    const _this = this
    const {t} = this
    const closeSavingMessage = message.loading(t('Saving'), 0)
    const preview_position = MapState.state.map.getPosition()
    preview_position.bbox = MapState.state.map.getBounds()
    LayerActions.saveStyle({
      layer_id: this.state.layer_id,
      style: this.state.style,
      labels: this.state.labels,
      legend_html: this.state.legend_html,
      preview_position
    },
    this.state._csrf,
    (err) => {
      closeSavingMessage()
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.props.onSubmit(_this.state.layer_id, _this.state.name)
      }
    })
  }

  onPrev = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  setRasterOpacity = (opacity: number) => {
    const elc = this.state.external_layer_config ? this.state.external_layer_config : {}
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    let style = null
    if (this.state.is_external && elc.type === 'ags-mapserver-tiles' && elc.url) {
      style = MapStyles.raster.rasterStyleTileJSON(layer_id, this.state.shortid, elc.url + '?f=json', opacity, 'arcgisraster')
    } else if (this.state.is_external && elc.type === 'multiraster' && elc.layers) {
      style = MapStyles.raster.multiRasterStyleWithOpacity(layer_id, this.state.shortid, elc.layers, opacity, 'raster')
    } else {
      style = MapStyles.raster.rasterStyleWithOpacity(layer_id, this.state.shortid, elc, opacity)
    }

    const legend_html = MapStyles.legend.rasterLegend(this.state)
    LayerActions.setStyle({style, legend_html})
    this.setState({rasterOpacity: opacity})
  }

  onColorChange = (style: GLStyle, legend_html: string) => {
    LayerActions.setStyle({style, legend_html})
  }

  setStyle = (style: GLStyle) => {
    LayerActions.setStyle({style})
  }

  setLabels = (style: GLStyle, labels: Object) => {
    LayerActions.setStyle({style, labels})
  }

  setLegend = (legend_html: string) => {
    LayerActions.setStyle({legend_html})
  }

  reloadMap = (MapState: Object) => {
    MapState.state.map.reloadStyle()
  }

  resetStyle = () => {
    const {t} = this
    confirm({
      title: t('Confirm Reset'),
      content: t('Warning! This will permanently delete all custom style settings from this layer.'),
      okText: t('Reset'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk () {
        LayerActions.resetStyle()
      }
    })
  }

  render () {
    const {reloadMap, t} = this
    const showMap = this.props.waitForTileInit ? this.state.tileServiceInitialized : true
    const {layer_id, style, preview_position} = this.state
    const {showPrev} = this.props
    let mapExtent
    if (preview_position && preview_position.bbox) {
      const bbox = preview_position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    const externalLayerConfig: Object = this.state.external_layer_config ? this.state.external_layer_config : {}
    const legendCode: string = this.state.legend_html ? this.state.legend_html : ''
    const cssStyle: Object = this.state.style ? this.state.style : {}

    let colorChooserMode = 'default'
    if (this.state.is_external &&
      (externalLayerConfig.type === 'raster' ||
      externalLayerConfig.type === 'multiraster' ||
      externalLayerConfig.type === 'ags-mapserver-tiles')) {
      colorChooserMode = 'external'
    } else if (this.state.is_external && externalLayerConfig.type === 'mapbox-style') {
      colorChooserMode = 'mapbox'
    }

    return (
      <Row style={{marginBottom: '20px'}}>
        <Row style={{marginBottom: '20px', textAlign: 'center'}}>
          <Col sm={24} md={12}>
            <h5>{t('Choose Preview')}</h5>
            {(layer_id !== undefined && layer_id !== -1 && showMap) &&
              <div>
                <Row>
                  <Map
                    id='layer-style-map' className='z-depth-2' insetMap={false} style={{height: '300px', width: '400px', margin: 'auto'}}
                    glStyle={style}
                    showLogo
                    mapConfig={this.props.mapConfig}
                    fitBounds={mapExtent}
                    primaryColor={MAPHUBS_CONFIG.primaryColor}
                    logoSmall={MAPHUBS_CONFIG.logoSmall}
                    logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                    logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                    t={t}
                    locale={this.state.locale}
                    mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                    DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                    earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
                  />
                </Row>
                <Row style={{width: '400px', position: 'relative', margin: 'auto'}}>
                  <MiniLegend
                    t={t} style={{position: 'absolute', height: 'auto', width: '400px', margin: 'auto'}}
                    collapsible={false} hideInactive={false} showLayersButton={false}
                    layers={[this.state]}
                  />
                </Row>
              </div>}
          </Col>
          <Subscribe to={[MapContainer]}>
            {MapState => (
              <Col sm={24} md={12} style={{width: '425px'}}>
                {colorChooserMode === 'default' &&
                  <div>
                    <h5>{t('Choose Style')}</h5>
                    <LayerDesigner
                      onColorChange={this.onColorChange}
                      style={cssStyle} onStyleChange={this.setStyle}
                      labels={this.state.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setStyle}
                      layer={this.state}
                      legend={legendCode} onLegendChange={this.setLegend}
                    />
                  </div>}
                {colorChooserMode === 'external' &&
                  <div>
                    <h5>{t('Choose Style')}</h5>
                    <OpacityChooser
                      value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
                      style={cssStyle} onStyleChange={this.setStyle} onColorChange={this.onColorChange}
                      layer={this.state}
                      legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced
                      t={t}
                    />
                  </div>}
                {colorChooserMode === 'mapbox' &&
                  <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
                    <b>{t('Mapbox Studio Style Layer')}</b>
                    <p>{t('If you are the owner of this layer, click here to edit in Mapbox Studio on mapbox.com')}</p>
                    <Button type='primary' target='_blank' rel='noopener noreferrer' href={'https://www.mapbox.com/studio/styles/' + externalLayerConfig.mapboxid + '/edit'}>{t('Edit in Mapbox Studio')}</Button>
                    <p>{t('Once you have published your style on Mapbox,click refresh the preview map.')}
                      <b>{t('It may take a few minutes for the changes to appear, your layer will update automatically.')}</b>
                    </p>
                    <Button type='primary' onClick={() => { reloadMap(MapState) }}> {t('Reload')}</Button>
                  </div>}
                <div className='right'>
                  <Button type='primary' onClick={this.resetStyle} style={{marginRight: '10px'}}>{t('Reset')}</Button>
                  <Button type='primary' onClick={() => { this.onSubmit(MapState) }}>{t('Save')}</Button>
                </div>
              </Col>
            )}
          </Subscribe>
        </Row>
        {showPrev &&
          <div className='left'>
            <Button type='primary' onClick={this.onPrev}><i className='material-icons left'>arrow_back</i>{this.props.prevText}</Button>
          </div>}
      </Row>
    )
  }
}
