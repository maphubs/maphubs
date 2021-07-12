import React from 'react'
import InteractiveMap from '../src/components/Map/InteractiveMap'
import Header from '../src/components/header'
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
import Comments from '../src/components/Comments'
import TerraformerGL from '../src/services/terraformerGL'
import GroupTag from '../src/components/Groups/GroupTag'
import Licenses from '../src/components/CreateLayer/licenses'
import LayerNotes from '../src/components/CreateLayer/LayerNotes'
import DataGrid from '../src/components/DataGrid/DataGrid'
import MapStyles from '../src/components/Map/Styles'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import MapContainer from '../src/components/Map/containers/MapContainer'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import turf_area from '@turf/area'
import turf_length from '@turf/length'
import numeral from 'numeral'
import slugify from 'slugify'
import LayerExport from '../src/components/LayerInfo/LayerExport'
import Stats from '../src/components/LayerInfo/Stats'
import ExternalLink from '../src/components/LayerInfo/ExternalLink'
import DataEditorContainer from '../src/components/Map/containers/DataEditorContainer'
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

import fireResizeEvent from '../src/services/fire-resize-event'

import ErrorBoundary from '../src/components/ErrorBoundary'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import moment from 'moment-timezone'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import getConfig from 'next/config'
import { Layer } from '../src/types/layer'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const TabPane = Tabs.TabPane
const { Title } = Typography

const debug = DebugService('layerinfo')

type Props = {
  layer: Layer
  notes: string
  stats: Record<string, any>
  canEdit: boolean
  createdByUser: Record<string, any>
  updatedByUser: Record<string, any>
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
type DefaultProps = {
  stats: Record<string, any>
  canEdit: boolean
}
type State = {
  userResize?: boolean
  geoJSON?: Record<string, any>
  dataMsg?: string
  area?: number
  length: number
  count?: number
}
export default class LayerInfo extends React.Component<Props, State> {
  BaseMapState: BaseMapContainer
  MapState: MapContainer
  DataEditorState: DataEditorContainer

  menuButton: HTMLDivElement
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

  static defaultProps: DefaultProps = {
    stats: {
      maps: 0,
      stories: 0
    },
    canEdit: false
  }
  state: State = {
    length: 0,
    dataMsg: this.t('Data Loading')
  }

  constructor(props: Props) {
    super(props)
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

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
    this.DataEditorState = new DataEditorContainer()
  }

  async componentDidMount(): Promise<void> {
    const { t, props } = this
    const { layer } = props
    const elc = layer.external_layer_config

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
            const res = await request.get(elc.data).type('json').accept('json')
            geoJSON = res.body

            break
          }
          default: {
            this.setState({
              dataMsg: t('Data table not support for this layer.')
            })
          }
        }

        if (geoJSON)
          this.setState({
            geoJSON
          })
      } else {
        this.getGeoJSON()

        this.setState({
          dataMsg: t('Data Loading')
        })
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

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!this.state.userResize) {
      fireResizeEvent()
    }
  }

  getGeoJSON = async (): Promise<void> => {
    const { layer } = this.props
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
          area = areaM2 / 10000
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

      this.setState({
        geoJSON,
        count,
        area,
        length
      })
    } catch (err) {
      debug.error(err)
    }
  }
  openEditor = (): void => {
    const baseUrl = urlUtil.getBaseUrl()
    window.location.assign(
      `${baseUrl}/map/new?editlayer=${this.props.layer.layer_id}${window.location.hash}`
    )
  }
  copyToClipboard = (val: string): void => {
    navigator.clipboard.writeText(val)
  }

  render(): JSX.Element {
    const {
      openEditor,
      t,
      props,
      state,
      BaseMapState,
      MapState,
      DataEditorState
    } = this
    const {
      layer,
      canEdit,
      updatedByUser,
      stats,
      notes,
      mapConfig,
      headerConfig
    } = props
    const { geoJSON, dataMsg, locale, count, area, _csrf } = state
    const glStyle = layer.style
    const showMapEditButton = canEdit && !layer.is_external && !layer.remote
    const showAddPhotoPointButton =
      showMapEditButton && layer.data_type === 'point'

    const editButton = canEdit ? (
      <Fab
        icon={<MoreVertIcon />}
        mainButtonStyles={{
          backgroundColor: MAPHUBS_CONFIG.primaryColor
        }}
        position={{
          bottom: 65,
          right: 0
        }}
      >
        <Action
          text={t('Manage Layer')}
          onClick={() => {
            window.location.assign(
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
              window.location.assign(`/layer/adddata/${layer.layer_id}`)
            }}
          >
            <PhotoIcon />
          </Action>
        )}
      </Fab>
    ) : (
      <div
        ref={(el) => {
          this.menuButton = el
        }}
        className='hide-on-med-and-up'
      >
        <Fab
          icon={<MapIcon />}
          text={t('View Map')}
          mainButtonStyles={{
            backgroundColor: MAPHUBS_CONFIG.primaryColor
          }}
          event='click'
          onClick={() => {
            window.location.assign(
              `/layer/map/${layer.layer_id}/${slugify(t(layer.name))}`
            )
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
      const localizedDescription = this.t(layer.description)
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
    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState, MapState, DataEditorState]}>
          <Header {...headerConfig} />
          <main
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
                          )&nbsp;
                          {t('by') + ' ' + updatedByUser.display_name}
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
                            )&nbsp;
                            {t('by') + ' ' + updatedByUser.display_name}
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
                          {state.length > 0 && (
                            <p>
                              <b>{t('Length')} </b>
                              {numeral(state.length).format('0,0.00')} km
                            </p>
                          )}
                        </Card>
                      </Col>
                    </Row>
                    <Stats views={layer.views} stats={stats} t={t} />
                  </TabPane>
                  <TabPane tab={t('Notes')} key='notes'>
                    <LayerNotes
                      canEdit={canEdit}
                      notes={notes}
                      layer_id={layer.layer_id}
                      t={t}
                      _csrf={_csrf}
                    />
                  </TabPane>
                  {MAPHUBS_CONFIG.enableComments && (
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
                          canEdit={canEdit}
                          t={t}
                          _csrf={_csrf}
                        />
                      )}
                      {!geoJSON && <Result title={dataMsg} />}
                    </Row>
                  </TabPane>
                  <TabPane tab={t('Download')} key='export'>
                    <LayerExport layer={layer} t={t} />
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
                  ref='interactiveMap'
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
                  primaryColor={MAPHUBS_CONFIG.primaryColor}
                  logoSmall={MAPHUBS_CONFIG.logoSmall}
                  logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                  logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                  mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                  DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                  earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
                  t={t}
                  locale={locale}
                />
              </Col>
            </Row>
            {editButton}
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
