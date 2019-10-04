// @flow
import React from 'react'
import Header from '../components/header'
import slugify from 'slugify'
import Comments from '../components/Comments'
import FeatureProps from '../components/Feature/FeatureProps'
import FeatureNotes from '../components/Feature/FeatureNotes'
import { Provider, Subscribe } from 'unstated'
import { Tabs, Row, Col } from 'antd'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import FRContainer from '../components/Feature/containers/FRContainer'
import FeaturePhotoStore from '../stores/FeaturePhotoStore'
import {FeatureMap, FeatureArea, FeatureLocation, FeatureExport, FeaturePhoto, ForestReportEmbed} from '../components/Feature'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {FeaturePhotoStoreState} from '../stores/FeaturePhotoStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import {getLayer} from '../components/Feature/Map/layer-feature'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const TabPane = Tabs.TabPane

const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

type Props = {
    feature: Object,
    notes: string,
    photo: Object,
    layer: Object,
    canEdit: boolean,
    locale: string,
    _csrf: string,
    mapConfig: Object,
    headerConfig: Object,
    user: Object
  }

  type State = {
    tab: string,
    frActive?: boolean
  } & LocaleStoreState & FeaturePhotoStoreState

export default class FeatureInfo extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(FeaturePhotoStore)
    this.stores.push(UserStore)
    const {locale, _csrf, user, feature, photo, mapConfig} = props
    Reflux.rehydrate(LocaleStore, {locale, _csrf})
    if (user) {
      Reflux.rehydrate(UserStore, {user})
    }
    Reflux.rehydrate(FeaturePhotoStore, {feature, photo})

    const baseMapContainerInit: {
      baseMap?: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()

    const layer = getLayer(props.layer, feature)

    let glStyle = {}
    if (layer.style) {
      glStyle = JSON.parse(JSON.stringify(layer.style))
    }

    this.FRState = new FRContainer({
      geoJSON: feature,
      featureLayer: layer,
      glStyle,
      mapLayers: [layer],
      mapConfig,
      FRRemainingThreshold: mapConfig ? mapConfig.FRRemainingThreshold : undefined
    })

    this.state = {
      tab: 'data'
    }
  }

  // Build edit link
  getEditLink = (map?: Object) => {
    // get map position
    let zoom = 10
    let position = {lng: 0, lat: 0}
    if (map) {
      position = map.getPosition()
      zoom = Math.ceil(position.zoom)
      if (zoom < 10) zoom = 10
    }
    const baseUrl = urlUtil.getBaseUrl()
    return `${baseUrl}/map/new?editlayer=${this.props.layer.layer_id}#${zoom}/${position.lat}/${position.lng}`
  }

  openEditor = (map?: Object) => {
    const editLink = this.getEditLink(map)
    window.location = editLink
  }

  selectTab = (tab: string) => {
    let frActive
    if (tab === 'forestreport' || this.state.tab === 'forestreport') {
      frActive = true
    }
    this.setState({tab, frActive})
  }

  changeGeoJSONFeature = (feature: Object) => {
    this.setState({feature})
  }

  render () {
    const {openEditor, selectTab, t} = this
    const {canEdit, layer, feature, headerConfig, notes} = this.props
    const {frActive} = this.state
    let geojsonFeature
    let geoJSONProps

    if (feature && layer && feature.features) {
      if (feature.features && feature.features.length > 0) {
        geojsonFeature = feature.features[0]
        geoJSONProps = feature.features[0].properties
      }
    }

    const baseUrl = urlUtil.getBaseUrl()
    const layerUrl = `${baseUrl}/layer/info/${layer.layer_id}/${slugify(this.t(layer.name))}`
    const mhid = feature.mhid.split(':')[1]

    let gpxLink
    if (layer.data_type === 'polygon') {
      gpxLink = `${baseUrl}/api/feature/gpx/${layer.layer_id}/${mhid}/feature.gpx`
    }

    // const firstSource = Object.keys(layer.style.sources)[0]
    // const presets = MapStyles.settings.getSourceSetting(layer.style, firstSource, 'presets')
    const presets = layer.presets

    let isPolygon
    if (geojsonFeature && geojsonFeature.geometry &&
      (geojsonFeature.geometry.type === 'Polygon' ||
        geojsonFeature.geometry.type === 'Polygon')) {
      isPolygon = true
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState, this.FRState]}>
          <Header {...headerConfig} />
          <Subscribe to={[MapContainer]}>
            {MapState => (
              <main style={{height: 'calc(100% - 52px)', marginTop: '0px'}}>
                <Row style={{height: '100%', margin: 0}}>
                  <Col span={12} style={{height: '100%'}}>
                    <style jsx global>{`
                      .ant-tabs-content {
                        height: calc(100% - 44px)
                      }
                      .ant-tabs-tabpane {
                        height: 100%;
                      }

                      .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
                        display: none;
                      }
                    `}
                    </style>
                    <Row style={{height: '100%', overflowY: 'hidden'}}>
                      <Tabs
                        defaultActiveKey='data'
                        onChange={selectTab}
                        style={{height: '100%'}}
                        tabBarStyle={{marginBottom: 0}}
                        animated={false}
                      >
                        <TabPane tab={t('Info')} key='data' style={{height: '100%'}}>
                          <Row style={{height: '100%'}}>
                            <Col sm={24} md={12} style={{height: '100%', border: '1px solid #ddd'}}>
                              <FeaturePhoto photo={this.state.photo} canEdit={canEdit} t={t} />
                              <div style={{marginLeft: '5px', overflowY: 'auto'}}>
                                <p style={{fontSize: '16px'}}><b>{t('Layer:')} </b><a href={layerUrl}>{this.t(layer.name)}</a></p>
                                <FeatureLocation geojson={geojsonFeature} t={t} locale={this.state.locale} />
                                {isPolygon &&
                                  <FeatureArea geojson={geojsonFeature} t={t} />}
                              </div>
                            </Col>
                            <Col sm={24} md={12} style={{height: '100%', border: '1px solid #ddd'}}>
                              <div style={{overflow: 'auto', height: 'calc(100% - 53px)'}}>
                                <FeatureProps data={geoJSONProps} presets={presets} t={t} />
                              </div>
                            </Col>
                          </Row>
                        </TabPane>
                        {(MAPHUBS_CONFIG.FR_ENABLE && this.state.user) &&
                          <TabPane tab={t('Forest Report')} key='forestreport' style={{height: '100%', overflow: 'hidden', padding: 0}}>
                            {frActive &&
                              <ForestReportEmbed
                                onModuleToggle={this.map.frToggle}
                              />}
                          </TabPane>}
                        {MAPHUBS_CONFIG.enableComments &&
                          <TabPane tab={t('Discussion')} key='discussion'>
                            <ErrorBoundary>
                              <Comments />
                            </ErrorBoundary>
                          </TabPane>}
                        <TabPane tab={t('Notes')} key='notes' style={{position: 'relative', height: '100%'}}>
                          <FeatureNotes notes={notes} canEdit={canEdit} layer_id={layer.layer_id} mhid={geoJSONProps.mhid} t={t} _csrf={this.props._csrf} />
                        </TabPane>
                        <TabPane tab={t('Export')} key='export' style={{position: 'relative', height: '100%', padding: '10px'}}>
                          <FeatureExport t={t} mhid={mhid} {...layer} />
                        </TabPane>
                      </Tabs>
                    </Row>
                  </Col>
                  <Col span={12} style={{height: '100%'}}>
                    <FeatureMap
                      ref={(el) => { this.map = el }}
                      geojson={feature} gpxLink={gpxLink}
                    />
                  </Col>
                </Row>
                {canEdit &&
                  <div ref='menuButton' className='fixed-action-btn action-button-bottom-right'>
                    <a className='btn-floating btn-large red red-text'>
                      <i className='large material-icons'>more_vert</i>
                    </a>
                    <ul>
                      {!layer.is_external &&
                        <li>
                          <FloatingButton
                            onClick={() => { openEditor(MapState.state.map) }} icon='mode_edit'
                            tooltip={t('Edit Map Data')} tooltipPosition='left'
                          />
                        </li>}
                    </ul>
                  </div>}
              </main>
            )}
          </Subscribe>
        </Provider>
      </ErrorBoundary>
    )
  }
}
