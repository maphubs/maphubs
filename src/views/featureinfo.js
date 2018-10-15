// @flow
import React from 'react'
import Header from '../components/header'
import slugify from 'slugify'
import Comments from '../components/Comments'
import FeatureProps from '../components/Feature/FeatureProps'
import FeatureNotes from '../components/Feature/FeatureNotes'
import HubEditButton from '../components/Hub/HubEditButton'
import { Provider, Subscribe } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import MapContainer from '../components/Map/containers/MapContainer'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import FeatureNotesActions from '../actions/FeatureNotesActions'
import FeatureNotesStore from '../stores/FeatureNotesStore'
import FeaturePhotoStore from '../stores/FeaturePhotoStore'
import {FeatureMap, FeatureArea, FeatureLocation, FeatureExport, FeaturePhoto, ForestReportEmbed} from '../components/Feature'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {FeaturePhotoStoreState} from '../stores/FeaturePhotoStore'
import type {FeatureNotesStoreState} from '../stores/FeatureNotesStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const urlUtil = require('../services/url-util')

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
    editingNotes: boolean,
    tab: string,
    feature: Object,
    frActive?: boolean
  } & LocaleStoreState & FeaturePhotoStoreState & FeatureNotesStoreState

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
    this.stores.push(FeatureNotesStore)
    this.stores.push(FeaturePhotoStore)
    this.stores.push(UserStore)
    const {locale, _csrf, user, feature, photo, notes, mapConfig} = props
    Reflux.rehydrate(LocaleStore, {locale, _csrf})
    if (user) {
      Reflux.rehydrate(UserStore, {user})
    }
    Reflux.rehydrate(FeatureNotesStore, {notes})
    Reflux.rehydrate(FeaturePhotoStore, {feature, photo})

    let baseMapContainerInit = {}
    if (mapConfig && mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)

    this.state = {
      editingNotes: false,
      tab: 'data',
      feature: props.feature
    }
  }

  componentDidMount () {
    M.Tabs.init(this.refs.tabs, {})
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.state.editingNotes) {
        const msg = _this.__('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
    if (this.props.canEdit) {
      M.FloatingActionButton.init(this.refs.editButton, {})
    }
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (!prevProps.canEdit && this.props.canEdit) {
      M.FloatingActionButton.init(this.refs.editButton, {})
    }
  }

  startEditingNotes = () => {
    this.setState({editingNotes: true})
  }

  stopEditingNotes = () => {
    const _this = this
    const {t} = this
    const geoJSONProps: Object = this.props.feature.features[0].properties

    FeatureNotesActions.saveNotes(this.props.layer.layer_id, geoJSONProps.mhid, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: t('Notes Saved')})
        _this.setState({editingNotes: false})
      }
    })
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
    const {canEdit, layer, mapConfig, headerConfig} = this.props
    const {feature} = this.state
    let geojsonFeature

    if (feature && layer && feature.features) {
      if (feature.features && feature.features.length > 0) {
        geojsonFeature = feature.features[0]
        var geoJSONProps = feature.features[0].properties
      }
    }

    const baseUrl = urlUtil.getBaseUrl()
    const layerUrl = `${baseUrl}/layer/info/${layer.layer_id}/${slugify(this._o_(layer.name))}`
    const mhid = feature.mhid.split(':')[1]

    let gpxLink
    if (layer.data_type === 'polygon') {
      gpxLink = `${baseUrl}/api/feature/gpx/${layer.layer_id}/${mhid}/feature.gpx`
    }

    // const firstSource = Object.keys(layer.style.sources)[0]
    // const presets = MapStyles.settings.getSourceSetting(layer.style, firstSource, 'presets')
    const presets = layer.presets
    const {activateFR, frToggle, onAlertClick} = this.map

    let isPolygon
    if (geojsonFeature && geojsonFeature.geometry &&
      (geojsonFeature.geometry.type === 'Polygon' ||
        geojsonFeature.geometry.type === 'Polygon')) {
      isPolygon = true
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...headerConfig} />
          <Subscribe to={[MapContainer]}>
            {MapState => (
              <main style={{height: 'calc(100% - 52px)', marginTop: '0px'}}>
                <div className='row' style={{height: '100%', margin: 0}}>
                  <div className='col s6 no-padding' style={{height: '100%'}}>
                    <div className='row no-margin' style={{height: '100%', overflowY: 'hidden'}}>
                      <ul ref='tabs' className='tabs' style={{}}>
                        <li className='tab'><a className='active' onClick={() => { selectTab('data') }} href='#data'>{t('Info')}</a></li>
                        {(MAPHUBS_CONFIG.FR_ENABLE && this.state.user) &&
                        <li className='tab'><a onClick={() => { selectTab('forestreport') }} href='#forestreport'>{t('Forest Report')}</a></li>
                        }
                        {MAPHUBS_CONFIG.enableComments &&
                        <li className='tab'><a onClick={() => { selectTab('discussion') }} href='#discussion'>{t('Discussion')}</a></li>
                        }
                        <li className='tab'><a onClick={() => { selectTab('notes') }} href='#notes'>{t('Notes')}</a></li>
                        <li className='tab'><a onClick={() => { selectTab('export') }} href='#export'>{t('Export')}</a></li>
                      </ul>
                      <div id='data' className='col s12 no-padding' style={{height: 'calc(100% - 48px)', overflowX: 'hidden'}}>
                        <div className='row no-margin' style={{height: '100%'}}>
                          <div className='col m6 s12 no-padding' style={{height: '100%', border: '1px solid #ddd'}}>
                            <FeaturePhoto photo={this.state.photo} canEdit={canEdit} />
                            <div style={{marginLeft: '5px', overflowY: 'auto'}}>
                              <p style={{fontSize: '16px'}}><b>{t('Layer:')} </b><a href={layerUrl}>{this._o_(layer.name)}</a></p>
                              <FeatureLocation geojson={geojsonFeature} />
                              {isPolygon &&
                                <FeatureArea geojson={geojsonFeature} />
                              }
                            </div>
                          </div>
                          <div className='col m6 s12 no-padding' style={{height: '100%', border: '1px solid #ddd'}}>
                            <div style={{overflow: 'auto', height: 'calc(100% - 53px)'}}>
                              <FeatureProps data={geoJSONProps} presets={presets} />
                            </div>
                          </div>
                        </div>
                      </div>
                      {(MAPHUBS_CONFIG.FR_ENABLE && this.state.user) &&
                        <div id='forestreport' className='col s12' style={{height: 'calc(100% - 48px)', overflow: 'hidden', padding: 0}}>
                          {(this.state.tab === 'forestreport' || this.state.frActive) &&
                            <ForestReportEmbed
                              geoJSON={feature}
                              onLoad={(config: Object) => { activateFR(config, feature) }}
                              onModuleToggle={frToggle}
                              onAlertClick={(alert) => { onAlertClick(alert, MapState.state.map) }}
                              remainingThreshold={mapConfig ? mapConfig.FRRemainingThreshold : undefined}
                              onGeoJSONChange={this.changeGeoJSONFeature}
                            />
                          }
                        </div>
                      }
                      {MAPHUBS_CONFIG.enableComments &&
                      <div id='discussion' className='col s12' style={{height: 'calc(100% - 48px)'}}>
                        <Comments />
                      </div>
                      }
                      <div id='notes' className='col s12' style={{position: 'relative', height: 'calc(100% - 48px)'}}>
                        <FeatureNotes editing={this.state.editingNotes} />
                        {canEdit &&
                          <HubEditButton editing={this.state.editingNotes}
                            style={{position: 'absolute'}}
                            startEditing={this.startEditingNotes} stopEditing={this.stopEditingNotes} />
                        }
                      </div>
                      <div id='export' className='col s12' style={{position: 'relative', height: 'calc(100% - 48px)'}}>
                        <FeatureExport mhid={mhid} {...layer} />
                      </div>
                    </div>
                  </div>
                  <div className='col s6 no-padding' style={{height: '100%'}}>
                    <FeatureMap ref={(map) => { this.map = map }}
                      layer={layer} geojson={feature} gpxLink={gpxLink} mapConfig={mapConfig} />
                  </div>
                </div>
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
                            tooltip={t('Edit Map Data')} tooltipPosition='left' />
                        </li>
                      }
                    </ul>
                  </div>
                }
              </main>
            )}
          </Subscribe>
        </Provider>
      </ErrorBoundary>
    )
  }
}
