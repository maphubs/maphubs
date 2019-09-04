// @flow
import React from 'react'
import InteractiveMap from '../components/Map/InteractiveMap'
import Header from '../components/header'
import _find from 'lodash.find'
import { Row, Col, notification, message, Tabs, Tooltip } from 'antd'
import Comments from '../components/Comments'
import TerraformerGL from '../services/terraformerGL'
import GroupTag from '../components/Groups/GroupTag'
import Licenses from '../components/CreateLayer/licenses'
import LayerNotes from '../components/CreateLayer/LayerNotes'
import EditButton from '../components/EditButton'
import LayerDataGrid from '../components/DataGrid/LayerDataGrid'
import LayerDataEditorGrid from '../components/DataGrid/LayerDataEditorGrid'
import MapStyles from '../components/Map/Styles'
import { Provider, Subscribe } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import turf_area from '@turf/area'
import turf_length from '@turf/length'
import numeral from 'numeral'
import slugify from 'slugify'
import UserStore from '../stores/UserStore'
import AutoSizer from 'react-virtualized-auto-sizer'
import LayerExport from '../components/LayerInfo/LayerExport'
import Stats from '../components/LayerInfo/Stats'
import ExternalLink from '../components/LayerInfo/ExternalLink'
import DataEditorContainer from '../components/Map/containers/DataEditorContainer'

import {addLocaleData, IntlProvider, FormattedRelative, FormattedDate, FormattedTime} from 'react-intl'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import id from 'react-intl/locale-data/id'
import pt from 'react-intl/locale-data/pt'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import fireResizeEvent from '../services/fire-resize-event'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const TabPane = Tabs.TabPane

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('layerinfo')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')
const moment = require('moment-timezone')

addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)
addLocaleData(id)
addLocaleData(pt)

type Props = {
  layer: Object,
  notes: string,
  stats: Object,
  canEdit: boolean,
  createdByUser: Object,
  updatedByUser: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

type DefaultProps = {
  stats: Object,
  canEdit: boolean,
}

type State = {
  editingData: boolean,
  gridHeight: number,
  gridHeightOffset: number,
  userResize?: boolean,
  geoJSON?: Object,
  dataMsg?: string,
  area?: number,
  length: number,
  count?: number
} & LocaleStoreState

export default class LayerInfo extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: DefaultProps = {
    stats: {maps: 0, stories: 0},
    canEdit: false
  }

  state: State = {
    editingData: false,
    gridHeight: 100,
    gridHeightOffset: 48,
    length: 0,
    dataMsg: this.t('Data Loading')
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    let baseMapContainerInit = {bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions, bingKey: MAPHUBS_CONFIG.BING_KEY, tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY, mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
    this.DataEditorState = new DataEditorContainer()
  }

  async componentDidMount () {
    const _this = this
    const {t} = this
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
    this.clipboard = require('clipboard-polyfill').default

    const {layer} = this.props
    const {editingData} = this.state
    const elc = layer.external_layer_config
    try {
      if (layer.is_external) {
        let geoJSON
        // retreive geoJSON data for layers
        if (elc.type === 'ags-mapserver-query') {
          geoJSON = await TerraformerGL.getArcGISGeoJSON(elc.url)
        } else if (elc.type === 'ags-featureserver-query') {
          geoJSON = await TerraformerGL.getArcGISFeatureServiceGeoJSON(elc.url)
        } else if (elc.type === 'geojson') {
          const res = await request.get(elc.data).type('json').accept('json')
          geoJSON = res.body
        } else {
          this.setState({dataMsg: t('Data table not support for this layer.')})
        }
        if (geoJSON) this.setState({geoJSON})
      } else {
        this.getGeoJSON()
        _this.setState({dataMsg: t('Data Loading')})
      }
    } catch (err) {
      debug.error(err)
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }

    window.addEventListener('beforeunload', (e) => {
      if (editingData) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (!this.state.userResize) {
      fireResizeEvent()
    }
    if (this.state.editingData && !prevState.editingData) {
      fireResizeEvent()
    }
  }

  getGeoJSON = async () => {
    const {layer} = this.props
    let baseUrl, dataUrl
    if (layer.remote) {
      baseUrl = 'https://' + layer.remote_host
      dataUrl = `${baseUrl}/api/layer/${layer.remote_layer_id}/export/geobuf/data.pbf`
    } else {
      baseUrl = urlUtil.getBaseUrl()
      dataUrl = `${baseUrl}/api/layer/${layer.layer_id}/export/geobuf/data.pbf`
    }
    try {
      const res = await request.get(dataUrl)
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
        geoJSON.features.forEach(feature => {
          if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            length += turf_length(feature.geometry, {units: 'kilometers'})
          }
        })
      }
      this.setState({geoJSON, count, area, length})
    } catch (err) {
      debug.error(err)
    }
  }

  openEditor = () => {
    const baseUrl = urlUtil.getBaseUrl()
    window.location = `${baseUrl}/map/new?editlayer=${this.props.layer.layer_id}${window.location.hash}`
  }

  startEditingData = () => {
    this.setState({editingData: true})
  }

  stopEditingData = (DataEditor: Object) => {
    const _this = this
    const {t} = this
    DataEditor.saveEdits(this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.setState({editingData: false})
        DataEditor.stopEditing()
        message.success(t('Data Saved - Reloading Page...'), 1, () => {
          location.reload()
        })
      }
    })
  }

  copyToClipboard = (val: string) => {
    this.clipboard.writeText(val)
  }

  render () {
    const {startEditingData, stopEditingData, openEditor, t} = this
    const {layer, canEdit} = this.props
    const { editingData } = this.state
    const glStyle = layer.style

    let editButton = ''
    const showMapEditButton = canEdit && !layer.is_external && !layer.remote
    const showAddPhotoPointButton = showMapEditButton && layer.data_type === 'point'
    if (canEdit) {
      editButton = (
        <div ref={(el) => { this.menuButton = el }} className='fixed-action-btn action-button-bottom-right'>
          <a className='btn-floating btn-large red red-text'>
            <i className='large material-icons'>more_vert</i>
          </a>
          <ul>
            {showMapEditButton &&
              <li>
                <Tooltip
                  title={t('Edit Map Data')}
                  placement='left'
                >
                  <a onClick={openEditor} className='btn-floating blue darken-1'>
                    <i className='material-icons'>mode_edit</i>
                  </a>
                </Tooltip>
              </li>}
            {showAddPhotoPointButton &&
              <li>
                <Tooltip
                  title={t('Add a Photo')}
                  placement='left'
                >
                  <a href={`/layer/adddata/${layer.layer_id}`} className='btn-floating blue darken-1'>
                    <i className='material-icons'>photo</i>
                  </a>
                </Tooltip>
              </li>}
            <li>
              <Tooltip
                title={t('Manage Layer')}
                placement='left'
              >
                <a className='btn-floating yellow' href={`/layer/admin/${layer.layer_id}/${slugify(t(layer.name))}`}>
                  <i className='material-icons'>settings</i>
                </a>
              </Tooltip>
            </li>
          </ul>
        </div>
      )
    } else {
      editButton = (
        <div ref={(el) => { this.menuButton = el }} className='fixed-action-btn action-button-bottom-right hide-on-med-and-up'>
          <Tooltip
            title={t('View Map')}
            placement='left'
          >
            <a
              className='btn-floating btn-large red'
              href={`/layer/map/${layer.layer_id}/${slugify(t(layer.name))}`}
            >
              <i className='material-icons'>map</i>
            </a>
          </Tooltip>
        </div>
      )
    }

    const guessedTz = moment.tz.guess()
    const creationTimeObj = moment.tz(layer.creation_time, guessedTz)
    const creationTime = creationTimeObj.format()
    const updatedTimeObj = moment.tz(layer.last_updated, guessedTz)
    const updatedTimeStr = updatedTimeObj.format()
    let updatedTime = ''
    if (updatedTimeObj > creationTimeObj) {
      updatedTime = (
        <p style={{fontSize: '16px'}}><b>{t('Last Update:')} </b>
          <IntlProvider locale={this.state.locale}>
            <FormattedDate value={updatedTimeStr} />
          </IntlProvider>&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedTime value={updatedTimeStr} />
          </IntlProvider>&nbsp;
          (<IntlProvider locale={this.state.locale}>
            <FormattedRelative value={updatedTimeStr} />
          </IntlProvider>)&nbsp;
          {t('by') + ' ' + this.props.updatedByUser.display_name}
        </p>
      )
    }

    const licenseOptions = Licenses.getLicenses(t)
    const license = _find(licenseOptions, {value: layer.license})

    let descriptionWithLinks = ''

    if (layer.description) {
      // regex for detecting links
      const localizedDescription = this.t(layer.description)
      const regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>")
    }

    const firstSource = Object.keys(layer.style.sources)[0]
    const presets = MapStyles.settings.getSourceSetting(layer.style, firstSource, 'presets')

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState, this.MapState, this.DataEditorState]}>
          <Header {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 51px)', marginTop: 0}}>
            <Row style={{height: '100%', margin: 0}}>
              <Col sm={24} md={12} style={{height: '100%'}}>
                {layer.private &&
                  <div style={{position: 'absolute', top: '15px', right: '10px'}}>
                    <Tooltip
                      title={t('Private')}
                      placement='left'
                    >
                      <i className='material-icons grey-text text-darken-3'>lock</i>
                    </Tooltip>
                  </div>}

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
                <Tabs
                  defaultActiveKey='info'
                  style={{height: '100%'}}
                  tabBarStyle={{marginBottom: 0}}
                  animated={false}
                >
                  <TabPane tab={t('Info')} key='info' style={{position: 'relative'}}>
                    <Row style={{height: '50%', overflowY: 'auto', overflowX: 'hidden'}}>
                      <Col
                        sm={24} md={12}
                        style={{height: '100%', padding: '5px', border: '1px solid #ddd', minHeight: '200px', overflowY: 'auto'}}
                      >
                        <div style={{width: '100%'}}>
                          <h5 className='word-wrap' style={{marginTop: 0}}>{t(layer.name)}</h5>
                          <GroupTag group={layer.owned_by_group_id} size={25} fontSize={12} />
                          <p style={{fontSize: '16px', maxHeight: '55px', overflow: 'auto'}}><b>{t('Data Source:')}</b> {t(layer.source)}</p>
                          <p style={{fontSize: '16px'}}><b>{t('License:')}</b> {license.label}</p><div dangerouslySetInnerHTML={{__html: license.note}} />
                          <ExternalLink layer={layer} t={t} />
                        </div>
                      </Col>
                      <Col sm={24} md={12} style={{height: '100%', padding: '5px', minHeight: '200px', overflow: 'auto', border: '1px solid #ddd'}}>
                        <p className='word-wrap' style={{fontSize: '16px'}}><b>{t('Description:')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}} />
                      </Col>
                    </Row>
                    <Row style={{height: 'calc(50% - 58px)'}}>
                      <Col sm={24} md={12} style={{height: '100%', padding: '5px', border: '1px solid #ddd'}}>
                        <p style={{fontSize: '16px'}}><b>{t('Created:')} </b>
                          <IntlProvider locale={this.state.locale}>
                            <FormattedDate value={creationTime} />
                          </IntlProvider>&nbsp;
                          <IntlProvider locale={this.state.locale}>
                            <FormattedTime value={creationTime} />
                          </IntlProvider>&nbsp;
                      (
                          <IntlProvider locale={this.state.locale}>
                            <FormattedRelative value={creationTime} />
                          </IntlProvider>
                      )&nbsp;
                          {t('by') + ' ' + this.props.updatedByUser.display_name}
                        </p>
                        {updatedTime}
                      </Col>
                      <Col sm={24} md={12} style={{height: '100%', padding: '5px', border: '1px solid #ddd'}}>
                        <p style={{fontSize: '16px'}}><b>{t('Feature Count:')} </b>{numeral(this.state.count).format('0,0')}</p>
                        {this.state.area &&
                          <p style={{fontSize: '16px'}}><b>{t('Area:')} </b>{numeral(this.state.area).format('0,0.00')} ha</p>}
                        {this.state.length > 0 &&
                          <p style={{fontSize: '16px'}}><b>{t('Length:')} </b>{numeral(this.state.length).format('0,0.00')} km</p>}
                      </Col>
                    </Row>
                    <Stats views={layer.views} stats={this.props.stats} t={t} />
                  </TabPane>
                  <TabPane tab={t('Notes')} key='notes'>
                    <LayerNotes canEdit={canEdit} notes={this.props.notes} layer_id={layer.layer_id} t={t} _csrf={this.state._csrf} />
                  </TabPane>
                  {MAPHUBS_CONFIG.enableComments &&
                    <TabPane tab={t('Discuss')} key='discuss'>
                      <ErrorBoundary>
                        <Comments />
                      </ErrorBoundary>
                    </TabPane>}
                  <TabPane tab={t('Data')} key='data'>
                    <Subscribe to={[DataEditorContainer]}>
                      {DataEditor => {
                        return (
                          <Row style={{height: '100%'}}>
                            <AutoSizer disableWidth>
                              {({ height }) => (
                                <>
                                  {editingData &&
                                    <LayerDataEditorGrid
                                      layer={layer}
                                      height={height}
                                      geoJSON={this.state.geoJSON}
                                      presets={presets}
                                      canEdit
                                    />}
                                  {!editingData &&
                                    <LayerDataGrid
                                      layer_id={layer.layer_id}
                                      height={height}
                                      geoJSON={this.state.geoJSON}
                                      presets={presets}
                                      canEdit={canEdit}
                                    />}
                                </>
                              )}
                            </AutoSizer>
                            {canEdit &&
                              <EditButton
                                editing={editingData}
                                style={{position: 'absolute', bottom: '10px'}}
                                startEditing={startEditingData} stopEditing={() => { stopEditingData(DataEditor) }}
                              />}
                          </Row>
                        )
                      }}
                    </Subscribe>
                  </TabPane>
                  <TabPane tab={t('Export')} key='export'>
                    <LayerExport layer={layer} />
                  </TabPane>
                </Tabs>
              </Col>
              <Col sm={24} md={12} className='hide-on-small-only' style={{height: '100%'}}>
                <InteractiveMap
                  ref='interactiveMap' height='100vh - 50px'
                  fitBounds={layer.preview_position.bbox}
                  style={glStyle}
                  layers={[layer]}
                  map_id={layer.layer_id}
                  mapConfig={this.props.mapConfig}
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
                  locale={this.props.locale}
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
