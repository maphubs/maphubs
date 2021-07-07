import React from 'react'
import Header from '../src/components/header'
import slugify from 'slugify'
import Comments from '../src/components/Comments'
import FeatureProps from '../src/components/Feature/FeatureProps'
import FeatureNotes from '../src/components/Feature/FeatureNotes'
import { Provider, Subscribe } from 'unstated'
import { Tabs, Row, Col } from 'antd'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import FRContainer from '../src/components/Feature/containers/FRContainer'
import FeaturePhotoStore from '../src/stores/FeaturePhotoStore'
import {
  FeatureMap,
  FeatureArea,
  FeatureLocation,
  FeatureExport,
  FeaturePhoto,
  ForestReportEmbed
} from '../src/components/Feature'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import type { LocaleStoreState } from '../src/stores/LocaleStore'
import type { FeaturePhotoStoreState } from '../src/stores/FeaturePhotoStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import { getLayer } from '../src/components/Feature/Map/layer-feature'
import getConfig from 'next/config'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const TabPane = Tabs.TabPane

type Props = {
  feature: Record<string, any>
  notes: string
  photo: Record<string, any>
  layer: Record<string, any>
  canEdit: boolean
  locale: string
  _csrf: string
  mapConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  tab: string
  frActive?: boolean
} & LocaleStoreState &
  FeaturePhotoStoreState
export default class FeatureInfo extends React.Component<Props, State> {
  BaseMapState: BaseMapContainer
  MapState: MapContainer
  FRState: FRContainer
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [FeaturePhotoStore, UserStore]
    const { locale, _csrf, user, feature, photo, mapConfig } = props
    Reflux.rehydrate(LocaleStore, {
      locale,
      _csrf
    })

    if (user) {
      Reflux.rehydrate(UserStore, {
        user
      })
    }

    Reflux.rehydrate(FeaturePhotoStore, {
      feature,
      photo
    })
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (mapConfig && mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = mapConfig.baseMapOptions
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
      FRRemainingThreshold: mapConfig
        ? mapConfig.FRRemainingThreshold
        : undefined
    })
    this.state = {
      tab: 'data'
    }
  }

  selectTab: any | ((tab: string) => void) = (tab: string) => {
    let frActive

    if (tab === 'forestreport' || this.state.tab === 'forestreport') {
      frActive = true
    }

    this.setState({
      tab,
      frActive
    })
  }
  changeGeoJSONFeature: any | ((feature: any) => void) = (
    feature: Record<string, any>
  ) => {
    this.setState({
      feature
    })
  }

  render(): JSX.Element {
    const { selectTab, t, props, state, map } = this
    const { canEdit, layer, feature, headerConfig, notes, _csrf } = props
    const { frActive, photo, locale, user } = state
    let geojsonFeature
    let geoJSONProps

    if (feature.features && feature.features.length > 0) {
      geojsonFeature = feature.features[0]
      geoJSONProps = feature.features[0].properties
    }

    const baseUrl = urlUtil.getBaseUrl()
    // fix possible error if layer.name doesn't translate correctly
    let layerName = 'unknown'

    if (layer.name) {
      const translatedLayerName = this.t(layer.name)

      if (translatedLayerName && typeof translatedLayerName === 'string') {
        layerName = translatedLayerName
      }
    }

    const layerUrl = `${baseUrl}/layer/info/${layer.layer_id}/${slugify(
      layerName
    )}`
    const mhid = feature.mhid.split(':')[1]
    let gpxLink

    if (layer.data_type === 'polygon') {
      gpxLink = `${baseUrl}/api/feature/gpx/${layer.layer_id}/${mhid}/feature.gpx`
    }

    // const firstSource = Object.keys(layer.style.sources)[0]
    // const presets = MapStyles.settings.getSourceSetting(layer.style, firstSource, 'presets')
    const presets = layer.presets
    let isPolygon

    if (
      geojsonFeature &&
      geojsonFeature.geometry &&
      (geojsonFeature.geometry.type === 'Polygon' ||
        geojsonFeature.geometry.type === 'MultiPolygon')
    ) {
      isPolygon = true
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState, this.FRState]}>
          <Header {...headerConfig} />
          <Subscribe to={[MapContainer]}>
            {(MapState) => (
              <main
                style={{
                  height: 'calc(100% - 52px)',
                  marginTop: '0px'
                }}
              >
                <Row
                  style={{
                    height: '100%',
                    margin: 0
                  }}
                >
                  <Col
                    span={12}
                    style={{
                      height: '100%'
                    }}
                  >
                    <style jsx global>
                      {`
                        .ant-tabs-content {
                          height: calc(100% - 44px);
                        }
                        .ant-tabs-tabpane {
                          height: 100%;
                        }

                        .ant-tabs
                          > .ant-tabs-content
                          > .ant-tabs-tabpane-inactive {
                          display: none;
                        }

                        .ant-tabs-nav-container {
                          margin-left: 5px;
                        }
                      `}
                    </style>
                    <Row
                      style={{
                        height: '100%',
                        overflowY: 'hidden'
                      }}
                    >
                      <Tabs
                        defaultActiveKey='data'
                        onChange={selectTab}
                        style={{
                          height: '100%',
                          width: '100%'
                        }}
                        tabBarStyle={{
                          marginBottom: 0
                        }}
                        animated={false}
                      >
                        <TabPane
                          tab={t('Info')}
                          key='data'
                          style={{
                            height: '100%'
                          }}
                        >
                          <Row
                            style={{
                              height: '100%'
                            }}
                          >
                            <Col
                              sm={24}
                              md={12}
                              style={{
                                height: '100%',
                                border: '1px solid #ddd'
                              }}
                            >
                              <FeaturePhoto
                                photo={photo}
                                canEdit={canEdit}
                                t={t}
                              />
                              <div
                                style={{
                                  marginLeft: '5px',
                                  overflowY: 'auto'
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: '16px'
                                  }}
                                >
                                  <b>{t('Layer:')} </b>
                                  <a href={layerUrl}>{this.t(layer.name)}</a>
                                </p>
                                <FeatureLocation
                                  geojson={geojsonFeature}
                                  t={t}
                                  locale={locale}
                                />
                                {isPolygon && (
                                  <FeatureArea geojson={geojsonFeature} t={t} />
                                )}
                              </div>
                            </Col>
                            <Col
                              sm={24}
                              md={12}
                              style={{
                                height: '100%',
                                border: '1px solid #ddd'
                              }}
                            >
                              <div
                                style={{
                                  overflow: 'auto',
                                  height: 'calc(100% - 53px)'
                                }}
                              >
                                <FeatureProps
                                  data={geoJSONProps}
                                  presets={presets}
                                  t={t}
                                />
                              </div>
                            </Col>
                          </Row>
                        </TabPane>
                        {MAPHUBS_CONFIG.FR_ENABLE && user && (
                          <TabPane
                            tab={t('Forest Report')}
                            key='forestreport'
                            style={{
                              height: '100%',
                              overflow: 'hidden',
                              padding: 0
                            }}
                          >
                            {frActive && (
                              <ForestReportEmbed
                                onModuleToggle={map.frToggle}
                              />
                            )}
                          </TabPane>
                        )}
                        {MAPHUBS_CONFIG.enableComments && (
                          <TabPane tab={t('Discussion')} key='discussion'>
                            <ErrorBoundary>
                              <Comments />
                            </ErrorBoundary>
                          </TabPane>
                        )}
                        <TabPane
                          tab={t('Notes')}
                          key='notes'
                          style={{
                            position: 'relative',
                            height: '100%'
                          }}
                        >
                          <FeatureNotes
                            notes={notes}
                            canEdit={canEdit}
                            layer_id={layer.layer_id}
                            mhid={geoJSONProps.mhid}
                            t={t}
                            _csrf={_csrf}
                          />
                        </TabPane>
                        <TabPane
                          tab={t('Export')}
                          key='export'
                          style={{
                            position: 'relative',
                            height: '100%',
                            padding: '10px'
                          }}
                        >
                          <FeatureExport t={t} mhid={mhid} {...layer} />
                        </TabPane>
                      </Tabs>
                    </Row>
                  </Col>
                  <Col
                    span={12}
                    style={{
                      height: '100%'
                    }}
                  >
                    <FeatureMap
                      ref={(el) => {
                        this.map = el
                      }}
                      geojson={feature}
                      gpxLink={gpxLink}
                    />
                  </Col>
                </Row>
              </main>
            )}
          </Subscribe>
        </Provider>
      </ErrorBoundary>
    )
  }
}
