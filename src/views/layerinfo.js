// @flow
import React from 'react'
import InteractiveMap from '../components/InteractiveMap'
import Header from '../components/header'
import _find from 'lodash.find'
import Comments from '../components/Comments'
import TerraformerGL from '../services/terraformerGL.js'
import GroupTag from '../components/Groups/GroupTag'
import Licenses from '../components/CreateLayer/licenses'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import LayerNotes from '../components/CreateLayer/LayerNotes'
import HubEditButton from '../components/Hub/HubEditButton'
import LayerNotesActions from '../actions/LayerNotesActions'
import LayerNotesStore from '../stores/LayerNotesStore'
import LayerDataGrid from '../components/DataGrid/LayerDataGrid'
import LayerDataEditorGrid from '../components/DataGrid/LayerDataEditorGrid'
import MapStyles from '../components/Map/Styles'
import BaseMapStore from '../stores/map/BaseMapStore'
import DataEditorActions from '../actions/DataEditorActions'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import turf_area from '@turf/area'
import turf_length from '@turf/length'
import turf_bbox from '@turf/bbox'
import numeral from 'numeral'
import slugify from 'slugify'
import UserStore from '../stores/UserStore'
import {Tooltip} from 'react-tippy'
import LayerExport from '../components/LayerInfo/LayerExport'

import {addLocaleData, IntlProvider, FormattedRelative, FormattedDate, FormattedTime} from 'react-intl'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import fireResizeEvent from '../services/fire-resize-event'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'

const debug = require('../services/debug')('layerinfo')
const urlUtil = require('../services/url-util')

const $ = require('jquery')
const moment = require('moment-timezone')
let clipboard
if (process.env.APP_ENV === 'browser') {
  clipboard = require('clipboard-polyfill')
}

addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)

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
  editingNotes: boolean,
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
    stats: {maps: 0, stories: 0, hubs: 0},
    canEdit: false
  }

  state: State = {
    editingNotes: false,
    editingData: false,
    gridHeight: 100,
    gridHeightOffset: 48,
    length: 0
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerNotesStore)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(LayerNotesStore, {notes: this.props.notes})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  componentDidMount () {
    const _this = this
    M.Tabs.init(this.refs.tabs, {})
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})

    if (this.props.layer.is_external) {
      // retreive geoJSON data for layers
      if (this.props.layer.external_layer_config.type === 'ags-mapserver-query') {
        TerraformerGL.getArcGISGeoJSON(this.props.layer.external_layer_config.url)
          .then((geoJSON) => {
            return _this.setState({geoJSON})
          }).catch(err => {
            debug.error(err)
          })
        _this.setState({dataMsg: _this.__('Data Loading')})
      } else if (this.props.layer.external_layer_config.type === 'ags-featureserver-query') {
        TerraformerGL.getArcGISFeatureServiceGeoJSON(this.props.layer.external_layer_config.url)
          .then((geoJSON) => {
            return _this.setState({geoJSON})
          }).catch(err => {
            debug.error(err)
          })
        _this.setState({dataMsg: _this.__('Data Loading')})
      } else if (this.props.layer.external_layer_config.type === 'geojson') {
        request.get(this.props.layer.external_layer_config.data)
          .type('json').accept('json')
          .end((err, res) => {
            if (err) {
              MessageActions.showMessage({title: _this.__('Server Error'), message: err})
            } else {
              const geoJSON = res.body
              _this.setState({geoJSON})
            }
          })
        _this.setState({dataMsg: _this.__('Data Loading')})
      } else {
        _this.setState({dataMsg: _this.__('Data table not support for this layer.')})
      }
    } else {
      this.getGeoJSON()
      _this.setState({dataMsg: _this.__('Data Loading')})
    }

    window.addEventListener('beforeunload', (e) => {
      if (_this.state.editingNotes || _this.state.editingData) {
        const msg = _this.__('You have not saved your edits, your changes will be lost.')
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

  getGeoJSON = () => {
    const _this = this
    let baseUrl, dataUrl
    if (this.props.layer.remote) {
      baseUrl = 'https://' + this.props.layer.remote_host
      dataUrl = baseUrl + '/api/layer/' + this.props.layer.remote_layer_id + '/export/geobuf/data.pbf'
    } else {
      baseUrl = urlUtil.getBaseUrl()
      dataUrl = baseUrl + '/api/layer/' + this.props.layer.layer_id + '/export/geobuf/data.pbf'
    }

    request.get(dataUrl)
      .buffer(true)
      .responseType('arraybuffer')
      .parse(request.parse.image)
      .end((err, res) => {
        if (err) {
          debug.error(err)
        } else {
          const geoJSON = geobuf.decode(new Pbf(new Uint8Array(res.body)))
          const count = geoJSON.features.length
          let area
          let length = 0
          if (this.props.layer.data_type === 'polygon') {
            const areaM2 = turf_area(geoJSON)
            if (areaM2 && areaM2 > 0) {
              area = areaM2 / 10000.00
            }
          } else if (this.props.layer.data_type === 'line') {
            geoJSON.features.forEach(feature => {
              if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                length += turf_length(feature.geometry, {units: 'kilometers'})
              }
            })
          }

          _this.setState({geoJSON, count, area, length})
        }
      })
  }

  onTabSelect = () => {
    const _this = this

    const gridHeight = $(this.refs.dataTabContent).height() - _this.state.gridHeightOffset
    this.setState({gridHeight})

    $(window).resize(() => {
      const gridHeight = $(_this.refs.dataTabContent).height() - _this.state.gridHeightOffset
      _this.setState({gridHeight, userResize: true})
    })
  }

  onRowSelected = (idVal: string, idField: string) => {
    const _this = this
    if (this.state.geoJSON) {
      this.state.geoJSON.features.forEach((feature) => {
        if (idVal === feature.properties[idField]) {
          const bbox = turf_bbox(feature)
          _this.refs.interactiveMap.getMap().fitBounds(bbox, 16, 25)
        }
      })
    }
  }

  // Build edit link
  getEditLink = () => {
    // get map position
    const position = this.refs.interactiveMap.getMap().getPosition()
    let zoom = Math.ceil(position.zoom)
    if (zoom < 10) zoom = 10
    const baseUrl = urlUtil.getBaseUrl()
    return baseUrl + '/map/new?editlayer=' + this.props.layer.layer_id + '#' + zoom + '/' + position.lat + '/' + position.lng
  }

  openEditor = () => {
    const editLink = this.getEditLink()
    window.location = editLink
  }

  handleNewComment = () => {

  }

  startEditingNotes = () => {
    this.setState({editingNotes: true})
  }

  stopEditingNotes = () => {
    const _this = this

    LayerNotesActions.saveNotes(this.props.layer.layer_id, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: _this.__('Notes Saved')})
        _this.setState({editingNotes: false})
      }
    })
  }

  startEditingData = () => {
    this.setState({editingData: true})
  }

  stopEditingData = () => {
    const _this = this
    DataEditorActions.saveEdits(this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({
          message: _this.__('Data Saved - Reloading Page...'),
          dismissAfter: 1000,
          onDismiss () {
            location.reload()
          }
        })
        _this.setState({editingData: false})
        DataEditorActions.stopEditing()
      }
    })
  }

  copyToClipboard = (val: string) => {
    clipboard.writeText(val)
  }

  render () {
    const _this = this
    const glStyle = this.props.layer.style

    let tabContentDisplay = 'none'
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit'
    }

    let editButton = ''
    let notesEditButton
    let dataEditButton

    if (this.props.canEdit) {
      notesEditButton = (
        <HubEditButton editing={this.state.editingNotes}
          style={{position: 'absolute'}}
          startEditing={this.startEditingNotes} stopEditing={this.stopEditingNotes} />
      )

      dataEditButton = (
        <HubEditButton editing={this.state.editingData}
          style={{position: 'absolute', bottom: '10px'}}
          startEditing={this.startEditingData} stopEditing={this.stopEditingData} />
      )

      let mapEditButton = ''
      let addPhotoPointButton = ''
      if (!this.props.layer.is_external && !this.props.layer.remote) {
        mapEditButton = (
          <li>
            <Tooltip
              title={this.__('Edit Map Data')}
              position='left' inertia followCursor>
              <a onClick={this.openEditor} className='btn-floating blue darken-1'>
                <i className='material-icons'>mode_edit</i>
              </a>
            </Tooltip>
          </li>
        )
        if (this.props.layer.data_type === 'point') {
          addPhotoPointButton = (
            <li>
              <Tooltip
                title={this.__('Add a Photo')}
                position='left' inertia followCursor>
                <a href={'/layer/adddata/' + this.props.layer.layer_id} className='btn-floating blue darken-1'>
                  <i className='material-icons'>photo</i>
                </a>
              </Tooltip>
            </li>
          )
        }
      }
      editButton = (
        <div ref={(el) => { this.menuButton = el }} className='fixed-action-btn action-button-bottom-right'>
          <a className='btn-floating btn-large red red-text'>
            <i className='large material-icons'>more_vert</i>
          </a>
          <ul>
            {mapEditButton}
            {addPhotoPointButton}
            <li>
              <Tooltip
                title={this.__('Manage Layer')}
                position='left' inertia followCursor>
                <a className='btn-floating yellow' href={'/layer/admin/' + this.props.layer.layer_id + '/' + slugify(this._o_(this.props.layer.name))}>
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
            title={this.__('View Map')}
            position='left' inertia>
            <a className='btn-floating btn-large red'
              href={'/layer/map/' + this.props.layer.layer_id + '/' + slugify(this._o_(this.props.layer.name))}>
              <i className='material-icons'>map</i>
            </a>
          </Tooltip>
        </div>
      )
    }

    const guessedTz = moment.tz.guess()
    const creationTimeObj = moment.tz(this.props.layer.creation_time, guessedTz)
    const creationTime = creationTimeObj.format()
    const updatedTimeObj = moment.tz(this.props.layer.last_updated, guessedTz)
    const updatedTimeStr = updatedTimeObj.format()
    let updatedTime = ''
    if (updatedTimeObj > creationTimeObj) {
      updatedTime = (
        <p style={{fontSize: '16px'}}><b>{this.__('Last Update:')} </b>
          <IntlProvider locale={this.state.locale}>
            <FormattedDate value={updatedTimeStr} />
          </IntlProvider>&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedTime value={updatedTimeStr} />
          </IntlProvider>&nbsp;
          (<IntlProvider locale={this.state.locale}>
            <FormattedRelative value={updatedTimeStr} />
          </IntlProvider>)&nbsp;
          {this.__('by') + ' ' + this.props.updatedByUser.display_name}
        </p>
      )
    }

    const licenseOptions = Licenses.getLicenses(this.__)
    const license = _find(licenseOptions, {value: this.props.layer.license})

    let descriptionWithLinks = ''

    if (this.props.layer.description) {
      // regex for detecting links
      const localizedDescription = this._o_(this.props.layer.description)
      const regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>")
    }

    let remote = ''
    if (this.props.layer.remote) {
      const remoteURL = 'https://' + this.props.layer.remote_host + '/layer/info/' + this.props.layer.remote_layer_id + '/' + slugify(this._o_(this.props.layer.name))
      remote = (
        <p style={{fontSize: '16px'}}><b>{this.__('Remote Layer from: ')} </b>
          <a href={remoteURL} target='_blank' rel='noopener noreferrer'>{remoteURL}</a>
        </p>
      )
    }

    let external = ''
    if (this.props.layer.is_external && !this.props.layer.remote) {
      let externalUrl = this.props.layer.external_layer_config.url
      let type = ''
      if (this.props.layer.external_layer_type === 'openstreetmap') {
        type = 'OpenStreetMap'
        externalUrl = 'http://openstreetmap.org'
      } else if (this.props.layer.external_layer_type === 'planet') {
        type = 'Planet'
        externalUrl = 'https://planet.com'
      } else if (this.props.layer.external_layer_config.type === 'raster') {
        type = 'Raster'
        externalUrl = this.props.layer.external_layer_config.tiles[0]
      } else if ((!this.props.layer.external_layer_type || this.props.layer.external_layer_type === '') &&
              this.props.layer.external_layer_config.type) {
        type = this.props.layer.external_layer_config.type
      } else if (this.props.layer.external_layer_config.type === 'geojson') {
        type = 'GeoJSON'
        externalUrl = this.props.layer.external_layer_config.data
      } else {
        type = this.props.layer.external_layer_type
      }
      external = (
        <div>
          <p style={{fontSize: '16px'}}><b>{this.__('External Layer: ')}</b>{type}
            &nbsp;-&nbsp;
            <a href={externalUrl} target='_blank' rel='noopener noreferrer'>{externalUrl}</a>
            <Tooltip
              title={this.__('Copy to Clipboard')}
              position='left' inertia followCursor>
              <i className='material-icons omh-accent-text' style={{cursor: 'pointer'}} onClick={function () { _this.copyToClipboard(externalUrl) }}>launch</i>
            </Tooltip>
          </p>
        </div>
      )
    }

    let commentTab, commentPanel
    if (MAPHUBS_CONFIG.enableComments) {
      commentTab = (
        <li className='tab'><a href='#discuss'>{this.__('Discuss')}</a></li>
      )
      commentPanel = (
        <Comments />
      )
    }

    let privateIcon = ''
    if (this.props.layer.private) {
      privateIcon = (
        <div style={{position: 'absolute', top: '15px', right: '10px'}}>
          <Tooltip
            title={this.__('Private')}
            position='left' inertia followCursor>
            <i className='material-icons grey-text text-darken-3'>lock</i>
          </Tooltip>
        </div>
      )
    }

    const firstSource = Object.keys(this.props.layer.style.sources)[0]
    const presets = MapStyles.settings.getSourceSetting(this.props.layer.style, firstSource, 'presets')

    let dataGrid = ''
    if (this.state.editingData) {
      dataGrid = (
        <LayerDataEditorGrid
          layer={this.props.layer}
          gridHeight={this.state.gridHeight}
          geoJSON={this.state.geoJSON}
          presets={presets}
          onRowSelected={this.onRowSelected}
          canEdit
        />
      )
    } else {
      dataGrid = (
        <LayerDataGrid
          layer_id={this.props.layer.layer_id}
          gridHeight={this.state.gridHeight}
          geoJSON={this.state.geoJSON}
          presets={presets}
          onRowSelected={this.onRowSelected}
          canEdit={this.props.canEdit} />
      )
    }

    return (

      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 51px)', marginTop: 0}}>
          <div className='row' style={{height: '100%', margin: 0}}>
            <div className='col s12 m6 l6 no-padding' style={{height: '100%', position: 'relative'}}>
              {privateIcon}
              <div style={{margin: '10px', height: '50px'}}>
                <h5 className='word-wrap'>{this._o_(this.props.layer.name)}</h5>
              </div>

              <div className='row no-margin' style={{height: 'calc(100% - 78px)'}}>
                <ul ref='tabs' className='tabs' style={{overflowX: 'auto'}}>
                  <li className='tab'><a className='active' href='#info'>{this.__('Info')}</a></li>
                  <li className='tab'><a href='#notes'>{this.__('Notes')}</a></li>
                  {commentTab}
                  <li className='tab'><a href='#data' onClick={this.onTabSelect}>{this.__('Data')}</a></li>
                  <li className='tab'><a href='#export'>{this.__('Export')}</a></li>
                </ul>
                <div id='info' className='col s12 no-padding' style={{height: 'calc(100% - 47px)', position: 'relative'}}>
                  <div className='row word-wrap' style={{height: 'calc(100% - 75px)', marginLeft: '10px', marginRight: '10px', overflowY: 'auto', overflowX: 'hidden'}}>
                    {remote}
                    {external}
                    <div className='col m6 s12' style={{height: '160px', border: '1px solid #ddd'}}>
                      <p style={{fontSize: '16px'}}><b>{this.__('Feature Count:')} </b>{numeral(this.state.count).format('0,0')}</p>
                      {this.state.area &&
                        <p style={{fontSize: '16px'}}><b>{this.__('Area:')} </b>{numeral(this.state.area).format('0,0.00')} ha</p>
                      }
                      {this.state.length > 0 &&
                        <p style={{fontSize: '16px'}}><b>{this.__('Length:')} </b>{numeral(this.state.length).format('0,0.00')} km</p>
                      }
                    </div>
                    <div className='col m6 s12' style={{height: '160px', border: '1px solid #ddd'}}>
                     
                      <p style={{fontSize: '16px'}}><b>{this.__('Created:')} </b>
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
                        {this.__('by') + ' ' + this.props.updatedByUser.display_name}
                      </p>
                      {updatedTime}
                    </div>
                    <div className='col m6 s12' style={{height: 'calc(100% - 190px)', border: '1px solid #ddd'}}>
                      <p style={{fontSize: '16px'}}>
                        <b>{this.__('Group:')} </b>
                      </p>
                      <div>
                        <GroupTag group={this.props.layer.owned_by_group_id} size={25} fontSize={12} />
                      </div>
                      <p style={{fontSize: '16px', maxHeight: '55px', overflow: 'auto'}}><b>{this.__('Data Source:')}</b> {this._o_(this.props.layer.source)}</p>
                      <p style={{fontSize: '16px'}}><b>{this.__('License:')}</b> {license.label}</p><div dangerouslySetInnerHTML={{__html: license.note}} />
                    </div>
                    <div className='col m6 s12' style={{height: 'calc(100% - 190px)', overflow: 'auto', border: '1px solid #ddd'}}>
                      <p className='word-wrap' style={{fontSize: '16px'}}><b>{this.__('Description:')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}} />
                    </div>
                  </div>

                  <div className='row no-margin' style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF'}}>
                    <div className='col s6 m3 l3 center-align'>
                      <b className='center-align'>{this.__('Views')}</b>
                      <p className='center-align'>{this.props.layer.views}</p>
                    </div>
                    <div className='col s6 m3 l3 center-align'>
                      <b className='center-align'>{this.__('Maps')}</b>
                      <p className='center-align'>{this.props.stats.maps}</p>
                    </div>
                    <div className='col s6 m3 l3 center-align'>
                      <b className='center-align'>{this.__('Stories')}</b>
                      <p className='center-align'>{this.props.stats.stories}</p>
                    </div>
                    <div className='col s6 m3 l3 center-align'>
                      <b className='center-align'>{this.__('Hubs')}</b>
                      <p className='center-align'>{this.props.stats.hubs}</p>
                    </div>
                  </div>
                </div>
                <div id='notes' className='col s12' style={{height: 'calc(100% - 47px)', display: tabContentDisplay, position: 'relative'}}>
                  <LayerNotes editing={this.state.editingNotes} />
                  {notesEditButton}
                </div>
                <div id='discuss' className='col s12' style={{display: tabContentDisplay}}>
                  {commentPanel}
                </div>
                <div id='data' ref='dataTabContent' className='col s12 no-padding' style={{height: 'calc(100% - 47px)', display: tabContentDisplay}}>
                  <div className='row no-margin'>
                    {dataGrid}
                  </div>
                  {dataEditButton}
                </div>
                <div id='export' className='col s12' style={{display: tabContentDisplay}}>
                  <LayerExport layer={this.props.layer} />
                </div>
              </div>

            </div>
            <div className='col hide-on-small-only m6 l6 no-padding' style={{height: '100%'}}>
              <InteractiveMap ref='interactiveMap' height='100vh - 50px'
                fitBounds={this.props.layer.preview_position.bbox}
                style={glStyle}
                layers={[this.props.layer]}
                map_id={this.props.layer.layer_id}
                mapConfig={this.props.mapConfig}
                title={this.props.layer.name}
                showTitle={false}
                hideInactive={false}
                disableScrollZoom={false}
              />

            </div>
          </div>
          {editButton}
        </main>
      </ErrorBoundary>
    )
  }
}
