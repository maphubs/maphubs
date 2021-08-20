/* eslint-disable unicorn/numeric-separators-style */
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { getSession, useSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import Layout from '../../src/components/Layout'
import slugify from 'slugify'
import Comments from '../../src/components/Comments'
import FeatureProps from '../../src/components/Feature/FeatureProps'
import FeatureNotes from '../../src/components/Feature/FeatureNotes'
import { Tabs, Row, Col } from 'antd'
import useT from '../../src/hooks/useT'

import {
  FeatureArea,
  FeatureLocation,
  FeatureExport,
  FeaturePhoto,
  ForestReportEmbed
} from '../../src/components/Feature'

import ErrorBoundary from '../../src/components/ErrorBoundary'
import { getLayer } from '../../src/components/Feature/Map/layer-feature'

import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Feature } from '../../src/types/feature'

// SSR Only
import LayerModel from '../../src/models/layer'
import FeatureModel from '../../src/models/feature'
import PhotoAttachmentModel from '../../src/models/photo-attachment'
import PageModel from '../../src/models/page'

import dynamic from 'next/dynamic'
import { Layer } from '../../src/types/layer'
const InteractiveMap = dynamic(
  () => import('../../src/components/Maps/Map/InteractiveMap'),
  {
    ssr: false
  }
)

const TabPane = Tabs.TabPane

type Props = {
  feature: Feature
  notes: string
  photo: Record<string, any>
  layer: Layer
  canEdit: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [layerIdStr, mhid] = context.params.feature as string[]
  const layer_id = Number.parseInt(layerIdStr)

  const layer = await LayerModel.getLayerByID(layer_id)
  const session = await getSession(context)
  let canEdit
  if (session?.user) {
    canEdit = await LayerModel.allowedToModify(
      layer_id,
      session.user.id || session.user.sub
    )
  }

  if (!layer) {
    return {
      notFound: true
    }
  }

  const geoJSON = await FeatureModel.getGeoJSON(mhid, layer.layer_id)
  const notes = await FeatureModel.getFeatureNotes(mhid, layer.layer_id)
  if (geoJSON) {
    const photos = await PhotoAttachmentModel.getPhotosForFeature(
      layer.layer_id,
      mhid
    )
    let photo

    if (photos && Array.isArray(photos)) {
      photo = photos[0]
    }

    let featureName = 'Feature'

    if (geoJSON.features.length > 0 && geoJSON.features[0].properties) {
      const geoJSONProps = geoJSON.features[0].properties
      //get the feature name
      if (geoJSONProps.name) {
        featureName = geoJSONProps.name
      }
      // add id to props to support the map popups
      geoJSONProps.layer_id = layer.layer_id
      geoJSONProps.mhid = mhid
    }
    const mapConfig = await PageModel.getPageConfigs(['map'])[0]
    return {
      props: {
        feature: {
          name: featureName,
          type: geoJSON.type,
          features: geoJSON.features,
          layer_id: layer.layer_id,
          bbox: geoJSON.bbox,
          mhid
        },
        notes,
        photo,
        layer,
        canEdit,
        mapConfig
      }
    }
  }
}

const FeaturePage = ({
  feature,
  notes,
  photo,
  layer,
  canEdit
}: Props): JSX.Element => {
  const router = useRouter()
  const [session] = useSession()
  const { t, locale } = useT()
  const mapRef = useRef(null)
  const [tab, setTab] = useState('data')
  const [frActive, setFrActive] = useState(false)

  const [layer_id, mhid] = router.query.feature as string[]

  const maplayer = getLayer(layer, feature)

  // TODO: initialize redux FR State

  /*
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
    */

  const selectTab = (selectedTab: string) => {
    setTab(selectedTab)

    if (selectedTab === 'forestreport' || tab === 'forestreport') {
      setFrActive(true)
    }
  }

  const frToggle = (id: string): void => {
    if (mapRef.current) {
      switch (id) {
        case 'remaining': {
          mapRef.current.toggleVisibility(99999901)
          break
        }
        case 'loss': {
          mapRef.current.toggleVisibility(99999905)
          break
        }
        case 'glad': {
          mapRef.current.toggleVisibility(99999902)
          break
        }
        case 'ifl': {
          mapRef.current.toggleVisibility(99999903)
          break
        }
        case 'iflloss': {
          mapRef.current.toggleVisibility(99999904)
          break
        }
        // No default
      }
    }
  }

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
    const translatedLayerName = t(layer.name)

    if (translatedLayerName && typeof translatedLayerName === 'string') {
      layerName = translatedLayerName
    }
  }

  const layerUrl = `${baseUrl}/layer/info/${layer.layer_id}/${slugify(
    layerName
  )}`
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
    <ErrorBoundary t={t}>
      <Layout title={t('')}>
        <div
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

                  .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
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
                          feature={feature}
                          photo={photo}
                          canEdit={canEdit}
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
                            <a href={layerUrl}>{t(layer.name)}</a>
                          </p>
                          <FeatureLocation
                            geojson={geojsonFeature}
                            t={t}
                            locale={locale}
                          />
                          {isPolygon && (
                            <FeatureArea geojson={geojsonFeature} />
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
                  {process.env.NEXT_PUBLIC_FR_ENABLE === 'true' &&
                    session?.user && (
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
                          <ForestReportEmbed onModuleToggle={frToggle} />
                        )}
                      </TabPane>
                    )}
                  {process.env.NEXT_PUBLIC_ENABLE_COMMENTS && (
                    <TabPane tab={t('Discussion')} key='discussion'>
                      <ErrorBoundary t={t}>
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
                      initialNotes={notes}
                      canEdit={canEdit}
                      layer_id={layer.layer_id}
                      mhid={mhid}
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
                    <FeatureExport
                      mhid={mhid}
                      name={feature.name}
                      layer_id={layer.layer_id}
                      data_type={layer.data_type}
                      disable_export={layer.disable_export}
                    />
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
              <InteractiveMap
                height='100%'
                fitBounds={feature.bbox}
                layers={mapLayers}
                style={glStyle}
                map_id={layer.layer_id}
                mapConfig={mapConfig}
                disableScrollZoom={false}
                title={layer.name}
                hideInactive
                showTitle={false}
                showLegendLayersButton={false}
                gpxLink={gpxLink}
                locale={locale}
                primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
                earthEngineClientID={
                  process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID
                }
              />
            </Col>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default FeaturePage
