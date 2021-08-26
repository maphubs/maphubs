import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import ExternalLink from '../../../src/components/LayerInfo/ExternalLink'
import Layout from '../../../src/components/Layout'
import _find from 'lodash.find'
import {
  Row,
  Col,
  notification,
  Tabs,
  Tooltip,
  Typography,
  Card,
  Result
} from 'antd'
import Comments from '../../../src/components/Comments'
import TerraformerGL from '../../../src/services/terraformerGL'
import GroupTag from '../../../src/components/Groups/GroupTag'
import Licenses from '../../../src/components/CreateLayer/licenses'
import LayerNotes from '../../../src/components/CreateLayer/LayerNotes'
import DataGrid from '../../../src/components/Maps/DataGrid/DataGrid'
import MapStyles from '../../../src/components/Maps/Map/Styles'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import turf_area from '@turf/area'
import turf_length from '@turf/length'
import numeral from 'numeral'
import slugify from 'slugify'
import LayerExport from '../../../src/components/LayerInfo/LayerExport'
import Stats from '../../../src/components/LayerInfo/Stats'
import { Fab, Action } from 'react-tiny-fab'
import 'react-tiny-fab/dist/styles.css'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import LockIcon from '@material-ui/icons/Lock'
import PhotoIcon from '@material-ui/icons/Photo'
import MapIcon from '@material-ui/icons/Map'
import SettingsIcon from '@material-ui/icons/Settings'
import {
  IntlProvider,
  FormattedRelativeTime,
  FormattedDate,
  FormattedTime
} from 'react-intl'
import request from 'superagent'

import ErrorBoundary from '../../../src/components/ErrorBoundary'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import moment from 'moment-timezone'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Layer } from '../../../src/types/layer'
import useT from '../../../src/hooks/useT'
import { FeatureCollection } from 'geojson'
import { NextSeo } from 'next-seo'

//SSR Only
import LayerModel from '../../../src/models/layer'
import PageModel from '../../../src/models/page'
import LayerStatsModel from '../../../src/models/stats'

import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(
  () => import('../../../src/components/Maps/Map/InteractiveMap'),
  {
    ssr: false
  }
)

const TabPane = Tabs.TabPane
const { Title } = Typography

const debug = DebugService('layerinfo')

type GeoJSONState = {
  geoJSON?: FeatureCollection
  length: number
  count?: number
  area?: number
}

type Props = {
  layer: Layer
  layerNotes: { notes: string }
  allowedToModifyLayer: boolean
  mapConfig: Record<string, unknown>
  layerStats: { stats: { maps: number; stories: number } }
}

// use SSR for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  const layer_id = Number.parseInt(context.params.layerinfo[0])
  const layer = await LayerModel.getLayerByID(layer_id)
  if (!layer) {
    return {
      notFound: true
    }
  }

  layer.last_updated = layer.last_updated.toISOString()
  layer.creation_time = layer.creation_time.toISOString()

  const session = await getSession(context)
  let allowedToModifyLayer = null
  if (session?.user) {
    allowedToModifyLayer = await LayerModel.allowedToModify(
      layer_id,
      session.user.id || session.user.sub
    )
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      layer,
      layerNotes: await LayerModel.getLayerNotes(layer_id),
      layerStats: await LayerStatsModel.getLayerStats(layer_id),
      mapConfig,
      allowedToModifyLayer
    }
  }
}

const LayerInfo = ({
  layer,
  layerNotes,
  allowedToModifyLayer,
  mapConfig,
  layerStats
}: Props): JSX.Element => {
  const router = useRouter()
  const { t, locale } = useT()
  const [dataMsg, setDataMsg] = useState(t('Data Loading'))
  const [geoJSONState, setGeoJSONState] = useState<GeoJSONState>({
    length: 0
  })

  /*
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: process.env.NEXT_PUBLIC_BING_KEY,
      mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }
    */

  useEffect(() => {
    const elc = layer.external_layer_config

    const getGeoJSON = async (): Promise<void> => {
      let baseUrl, dataUrl

      if (layer.remote) {
        baseUrl = 'https://' + layer.remote_host
        dataUrl = `${baseUrl}/api/layer/${layer.remote_layer_id}/export/geobuf/data.pbf`
      } else {
        baseUrl = urlUtil.getBaseUrl()
        dataUrl = `${baseUrl}/api/layer/${layer.layer_id}/export/geobuf/data.pbf`
      }

      try {
        const res = await request
          .get(dataUrl)
          .responseType('blob')
          .parse(request.parse.image)
        const arrayBuffer = await new Response(res.body).arrayBuffer()
        const geoJSON = geobuf.decode(new Pbf(arrayBuffer))
        const count = geoJSON.features.length
        let area
        let length = 0

        if (layer.data_type === 'polygon') {
          const areaM2 = turf_area(geoJSON)

          if (areaM2 && areaM2 > 0) {
            area = areaM2 / 10_000
          }
        } else if (layer.data_type === 'line') {
          for (const feature of geoJSON.features) {
            if (
              feature.geometry.type === 'LineString' ||
              feature.geometry.type === 'MultiLineString'
            ) {
              length += turf_length(feature.geometry, {
                units: 'kilometers'
              })
            }
          }
        }

        setGeoJSONState({
          geoJSON,
          count,
          area,
          length
        })
      } catch (err) {
        debug.error(err)
      }
    }

    const loadGeoJSON = async () => {
      try {
        if (layer.is_external) {
          let geoJSON

          // retreive geoJSON data for layers
          switch (elc.type) {
            case 'ags-mapserver-query': {
              geoJSON = await TerraformerGL.getArcGISGeoJSON(elc.url)
              break
            }
            case 'ags-featureserver-query': {
              geoJSON = await TerraformerGL.getArcGISFeatureServiceGeoJSON(
                elc.url
              )
              break
            }
            case 'geojson': {
              const res = await request
                .get(elc.data)
                .type('json')
                .accept('json')
              geoJSON = res.body
              break
            }
            default: {
              setDataMsg(t('Data table not support for this layer.'))
            }
          }

          if (geoJSON)
            setGeoJSONState({
              geoJSON,
              count: geoJSONState.count,
              area: geoJSONState.area,
              length: geoJSONState.length
            })
        } else {
          getGeoJSON()
          setDataMsg(t('Data Loading'))
        }
      } catch (err) {
        debug.error(err)
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      }
    }
    loadGeoJSON()
  }, [geoJSONState, layer, t])

  const openEditor = (): void => {
    const baseUrl = urlUtil.getBaseUrl()
    router.push(
      `${baseUrl}/map/new?editlayer=${layer.layer_id}${window.location.hash}`
    )
  }

  const { geoJSON, count, area } = geoJSONState
  const glStyle = layer.style
  const showMapEditButton =
    allowedToModifyLayer && !layer.is_external && !layer.remote
  const showAddPhotoPointButton =
    showMapEditButton && layer.data_type === 'point'

  const editButton = allowedToModifyLayer ? (
    <Fab
      icon={<MoreVertIcon />}
      mainButtonStyles={{
        backgroundColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR
      }}
      position={{
        bottom: 65,
        right: 0
      }}
    >
      <Action
        text={t('Manage Layer')}
        onClick={() => {
          router.push(
            `/layer/admin/${layer.layer_id}/${slugify(t(layer.name))}`
          )
        }}
      >
        <SettingsIcon />
      </Action>
      {showMapEditButton && (
        <Action
          text={t('Edit Map Data')}
          style={{
            backgroundColor: 'green'
          }}
          onClick={openEditor}
        >
          <EditIcon />
        </Action>
      )}
      {showAddPhotoPointButton && (
        <Action
          text={t('Add Photo')}
          style={{
            backgroundColor: '#2196F3'
          }}
          onClick={() => {
            router.push(`/layer/adddata/${layer.layer_id}`)
          }}
        >
          <PhotoIcon />
        </Action>
      )}
    </Fab>
  ) : (
    <div className='hide-on-med-and-up'>
      <Fab
        icon={<MapIcon />}
        text={t('View Map')}
        mainButtonStyles={{
          backgroundColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR
        }}
        event='click'
        onClick={() => {
          router.push(`/layer/map/${layer.layer_id}/${slugify(t(layer.name))}`)
        }}
      />
    </div>
  )

  const guessedTz = moment.tz.guess()
  const creationTime = moment.tz(layer.creation_time, guessedTz)
  const daysSinceCreated = creationTime.diff(moment(), 'days')
  const updatedTime = moment.tz(layer.last_updated, guessedTz)
  const daysSinceUpdated = updatedTime.diff(moment(), 'days')
  const licenseOptions = Licenses.getLicenses(t)

  const license = _find(licenseOptions, {
    value: layer.license
  })

  let descriptionWithLinks = ''

  if (layer.description) {
    // regex for detecting links
    const localizedDescription = t(layer.description)
    const regex = /(https?:\/\/([\w.-]+)+(:\d+)?(\/([\w./]*(\?\S+)?)?)?)/gi
    descriptionWithLinks = localizedDescription.replace(
      regex,
      "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>"
    )
  }

  const firstSource = Object.keys(layer.style.sources)[0]
  const presets = MapStyles.settings.getSourceSetting(
    layer.style,
    firstSource,
    'presets'
  )

  const baseUrl = urlUtil.getBaseUrl()
  const canonical = `${baseUrl}/layer/${layer.layer_id}/${slugify(
    t(layer.name)
  )}`
  const imageUrl = `${baseUrl}/api/screenshot/layer/image/${layer.layer_id}.png`

  return (
    <>
      <NextSeo
        title={t(layer.name)}
        description={t(layer.description)}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title: t(layer.name),
          description: t(layer.description),
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: t(layer.name)
            }
          ],
          site_name: process.env.NEXT_PUBLIC_PRODUCT_NAME
        }}
        twitter={{
          handle: process.env.NEXT_PUBLIC_TWITTER,
          site: process.env.NEXT_PUBLIC_TWITTER,
          cardType: 'summary'
        }}
      />
      <ErrorBoundary t={t}>
        <Layout>
          <div
            style={{
              height: 'calc(100% - 51px)',
              marginTop: 0
            }}
          >
            <Row
              style={{
                height: '100%',
                margin: 0
              }}
            >
              <Col
                sm={24}
                md={12}
                style={{
                  height: '100%'
                }}
              >
                {layer.private && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '10px'
                    }}
                  >
                    <Tooltip title={t('Private')} placement='left'>
                      <LockIcon />
                    </Tooltip>
                  </div>
                )}

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
                <Tabs
                  defaultActiveKey='info'
                  style={{
                    height: '100%'
                  }}
                  tabBarStyle={{
                    marginBottom: 0
                  }}
                  animated={false}
                >
                  <TabPane
                    tab={t('Info')}
                    key='info'
                    style={{
                      position: 'relative'
                    }}
                  >
                    <Row
                      style={{
                        height: '50%',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                      }}
                    >
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          padding: '5px',
                          border: '1px solid #ddd',
                          minHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        <Row>
                          <Title
                            level={2}
                            style={{
                              marginTop: 0
                            }}
                          >
                            {t(layer.name)}
                          </Title>
                        </Row>
                        <Row>
                          <Col span={4}>
                            <GroupTag
                              group={layer.owned_by_group_id}
                              size={32}
                            />
                          </Col>
                          <Col span={20}>
                            <span
                              style={{
                                lineHeight: '32px'
                              }}
                            >
                              <b>{t('Group: ')}</b>
                              {layer.owned_by_group_id}
                            </span>
                          </Col>
                        </Row>
                        <Row>
                          <p
                            style={{
                              maxHeight: '55px',
                              overflow: 'auto'
                            }}
                          >
                            <b>{t('Data Source:')}</b> {t(layer.source)}
                          </p>
                        </Row>
                        <Row>
                          <p>
                            <b>{t('License:')}</b> {license.label}
                          </p>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: license.note
                            }}
                          />
                        </Row>
                        <Row>
                          <ExternalLink layer={layer} />
                        </Row>
                      </Col>
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          minHeight: '200px',
                          overflow: 'auto',
                          border: '1px solid #ddd'
                        }}
                      >
                        <Card
                          size='small'
                          bordered={false}
                          title={t('Description')}
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: descriptionWithLinks
                            }}
                          />
                        </Card>
                      </Col>
                    </Row>
                    <Row
                      style={{
                        height: 'calc(50% - 58px)'
                      }}
                    >
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          padding: '5px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <p
                          style={{
                            fontSize: '16px'
                          }}
                        >
                          <b>{t('Created:')} </b>
                          <IntlProvider locale={locale}>
                            <FormattedDate value={creationTime} />
                          </IntlProvider>
                          &nbsp;
                          <IntlProvider locale={locale}>
                            <FormattedTime value={creationTime} />
                          </IntlProvider>
                          &nbsp; (
                          <IntlProvider locale={locale}>
                            <FormattedRelativeTime
                              value={daysSinceCreated}
                              numeric='auto'
                              unit='day'
                            />
                          </IntlProvider>
                          )
                        </p>
                        {updatedTime > creationTime && (
                          <p
                            style={{
                              fontSize: '16px'
                            }}
                          >
                            <b>{t('Last Update:')} </b>
                            <IntlProvider locale={locale}>
                              <FormattedDate value={updatedTime} />
                            </IntlProvider>
                            &nbsp;
                            <IntlProvider locale={locale}>
                              <FormattedTime value={updatedTime} />
                            </IntlProvider>
                            &nbsp; (
                            <IntlProvider locale={locale}>
                              <FormattedRelativeTime
                                value={daysSinceUpdated}
                                numeric='auto'
                                unit='day'
                              />
                            </IntlProvider>
                            )
                          </p>
                        )}
                      </Col>
                      <Col
                        sm={24}
                        md={12}
                        style={{
                          height: '100%',
                          border: '1px solid #ddd'
                        }}
                      >
                        <Card
                          size='small'
                          bordered={false}
                          title={t('Info')}
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <p>
                            <b>{t('Feature Count:')} </b>
                            {numeral(count).format('0,0')}
                          </p>
                          {area && (
                            <p>
                              <b>{t('Area')} </b>
                              {numeral(area).format('0,0.00')} ha
                            </p>
                          )}
                          {geoJSONState.length > 0 && (
                            <p>
                              <b>{t('Length')} </b>
                              {numeral(geoJSONState.length).format('0,0.00')} km
                            </p>
                          )}
                        </Card>
                      </Col>
                    </Row>
                    <Stats stats={layerStats?.stats} />
                  </TabPane>
                  <TabPane tab={t('Notes')} key='notes'>
                    <LayerNotes
                      canEdit={allowedToModifyLayer}
                      initialNotes={layerNotes?.notes}
                      layer_id={layer.layer_id}
                    />
                  </TabPane>
                  {process.env.NEXT_PUBLIC_ENABLE_COMMENTS && (
                    <TabPane tab={t('Discuss')} key='discuss'>
                      <ErrorBoundary t={t}>
                        <Comments />
                      </ErrorBoundary>
                    </TabPane>
                  )}
                  <TabPane tab={t('Data')} key='data'>
                    <Row
                      style={{
                        height: '100%'
                      }}
                    >
                      {geoJSON && (
                        <DataGrid
                          layer={layer}
                          geoJSON={geoJSON}
                          presets={presets}
                          canEdit={allowedToModifyLayer}
                        />
                      )}
                      {!geoJSON && <Result title={dataMsg} />}
                    </Row>
                  </TabPane>
                  <TabPane tab={t('Download')} key='export'>
                    <LayerExport layer={layer} />
                  </TabPane>
                </Tabs>
              </Col>
              <Col
                sm={24}
                md={12}
                className='hide-on-small-only'
                style={{
                  height: '100%'
                }}
              >
                <InteractiveMap
                  height='100vh - 50px'
                  fitBounds={layer.preview_position.bbox}
                  style={glStyle}
                  layers={[layer]}
                  map_id={layer.layer_id}
                  mapConfig={mapConfig}
                  title={layer.name}
                  showTitle={false}
                  hideInactive={false}
                  disableScrollZoom={false}
                  primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
                  mapboxAccessToken={
                    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                  }
                  DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
                  earthEngineClientID={
                    process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID
                  }
                  locale={locale}
                />
              </Col>
            </Row>
            {editButton}
          </div>
        </Layout>
      </ErrorBoundary>
    </>
  )
}
export default LayerInfo
