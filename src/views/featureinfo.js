// @flow
import React from 'react'
import Header from '../components/header'
import slugify from 'slugify'
import Comments from '../components/Comments'
import FeatureProps from '../components/Feature/FeatureProps'
import FeatureNotes from '../components/Feature/FeatureNotes'
import HubEditButton from '../components/Hub/HubEditButton'
import MapStyles from '../components/Map/Styles'
import BaseMapStore from '../stores/map/BaseMapStore'
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

  state: State = {
    editingNotes: false,
    tab: 'data'
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(FeatureNotesStore)
    this.stores.push(FeaturePhotoStore)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(FeatureNotesStore, {notes: this.props.notes})
    Reflux.rehydrate(FeaturePhotoStore, {feature: this.props.feature, photo: this.props.photo})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
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
    const geoJSONProps: Object = this.props.feature.features[0].properties

    FeatureNotesActions.saveNotes(this.props.layer.layer_id, geoJSONProps.mhid, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: _this.__('Notes Saved')})
        _this.setState({editingNotes: false})
      }
    })
  }

  // Build edit link
  getEditLink = () => {
    // get map position
    const position = this.refs.map.getMap().getPosition()
    let zoom = Math.ceil(position.zoom)
    if (zoom < 10) zoom = 10
    const baseUrl = urlUtil.getBaseUrl()
    return baseUrl + '/map/new?editlayer=' + this.props.layer.layer_id + '#' + zoom + '/' + position.lat + '/' + position.lng
  }

  openEditor = () => {
    const editLink = this.getEditLink()
    window.location = editLink
  }

  selectTab = (tab: string) => {
    let frActive
    if (tab === 'forestreport' || this.state.tab === 'forestreport') {
      frActive = true
    }
    this.setState({tab, frActive})
  }

  render () {
    const _this = this
    let featureName: string = 'Unknown'

    const {canEdit} = this.props
    let geojsonFeature

    if (this.props.feature && this.props.layer && this.props.feature.features) {
      // glStyle = this.props.layer.style ? this.props.layer.style : styles[this.props.feature.layer.data_type];

      if (this.props.feature.features && this.props.feature.features.length > 0) {
        geojsonFeature = this.props.feature.features[0]
        var geoJSONProps = this.props.feature.features[0].properties
        if (geoJSONProps.name) {
          featureName = geoJSONProps.name
        }
      }
    }

    const baseUrl = urlUtil.getBaseUrl()

    let notesEditButton
    let editButton
    if (canEdit) {
      notesEditButton = (
        <HubEditButton editing={this.state.editingNotes}
          style={{position: 'absolute'}}
          startEditing={this.startEditingNotes} stopEditing={this.stopEditingNotes} />
      )

      let idEditButton
      if (!this.props.layer.is_external) {
        idEditButton = (
          <li>
            <FloatingButton
              onClick={this.openEditor} icon='mode_edit'
              tooltip={this.__('Edit Map Data')} tooltipPosition='left' />
          </li>
        )
      }
      editButton = (
        <div ref='menuButton' className='fixed-action-btn action-button-bottom-right'>
          <a className='btn-floating btn-large red red-text'>
            <i className='large material-icons'>more_vert</i>
          </a>
          <ul>
            {idEditButton}
          </ul>
        </div>
      )
    }

    const layerUrl = `${baseUrl}/layer/info/${this.props.layer.layer_id}/${slugify(this._o_(this.props.layer.name))}`
    const mhid = this.props.feature.mhid.split(':')[1]

    let gpxLink
    if (this.props.layer.data_type === 'polygon') {
      gpxLink = baseUrl + '/api/feature/gpx/' + this.props.layer.layer_id + '/' + mhid + '/feature.gpx'
    }

    const firstSource = Object.keys(this.props.layer.style.sources)[0]
    const presets = MapStyles.settings.getSourceSetting(this.props.layer.style, firstSource, 'presets')

    let frPanel
    if (MAPHUBS_CONFIG.FR_ENABLE && this.state.user) {
      if (this.state.tab === 'forestreport' || this.state.frActive) {
        frPanel = (
          <ForestReportEmbed
            geoJSON={this.props.feature}
            onLoad={this.map.activateFR}
            onAlertClick={this.map.onAlertClick}
          />
        )
      }
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 52px)', marginTop: '0px'}}>
          <div className='row' style={{height: '100%', margin: 0}}>
            <div className='col s6 no-padding' style={{height: '100%'}}>
              <div className='row no-margin' style={{height: '100%', overflowY: 'hidden'}}>
                <ul ref='tabs' className='tabs' style={{}}>
                  <li className='tab'><a className='active' onClick={function () { _this.selectTab('data') }} href='#data'>{this.__('Info')}</a></li>
                  {(MAPHUBS_CONFIG.FR_ENABLE && this.props.canEdit) &&
                  <li className='tab'><a onClick={function () { _this.selectTab('forestreport') }} href='#forestreport'>{this.__('Forest Report')}</a></li>
                  }
                  <li className='tab'><a onClick={function () { _this.selectTab('photo') }} href='#photo'>{this.__('Photo')}</a></li>
                  {MAPHUBS_CONFIG.enableComments &&
                  <li className='tab'><a onClick={function () { _this.selectTab('discussion') }} href='#discussion'>{this.__('Discussion')}</a></li>
                  }
                  <li className='tab'><a onClick={function () { _this.selectTab('notes') }} href='#notes'>{this.__('Notes')}</a></li>
                </ul>
                <div id='data' className='col s12 no-padding' style={{height: 'calc(100% - 48px)', overflowY: 'auto', overflowX: 'hidden'}}>
                  <p style={{fontSize: '16px', marginLeft: '10px'}}><b>{this.__('Name:')} </b>{featureName}</p>
                  <p style={{fontSize: '16px', marginLeft: '10px'}}><b>{this.__('Layer:')} </b><a href={layerUrl}>{this._o_(this.props.layer.name)}</a></p>
                  <div className='row no-margin' style={{height: '140px'}}>
                    <div className='col m6 s12' style={{height: '100%', border: '1px solid #ddd'}}>
                      <FeatureLocation geojson={geojsonFeature} />
                    </div>
                    <div className='col m6 s12' style={{height: '100%', border: '1px solid #ddd'}}>
                      <FeatureArea geojson={geojsonFeature} />
                    </div>
                  </div>
                  <div className='row no-margin' style={{height: 'calc(100% - 236px)'}}>
                    <div className='col m6 s12' style={{height: '100%', overflowY: 'auto', border: '1px solid #ddd'}}>
                      <h5>{this.__('Attributes')}</h5>
                      <FeatureProps data={geoJSONProps} presets={presets} />
                    </div>
                    <div className='col m6 s12 no-padding' style={{height: '100%', overflowY: 'auto', border: '1px solid #ddd'}}>
                      <FeatureExport mhid={mhid} {...this.props.layer} />
                    </div>
                  </div>
                </div>
                <div id='forestreport' className='col s12' style={{height: 'calc(100% - 48px)', overflow: 'hidden', padding: 0}}>
                  {frPanel}
                </div>
                <div id='photo' className='col s12' style={{height: 'calc(100% - 48px)', textAlign: 'center'}}>
                  {canEdit &&
                  <FeaturePhoto photo={this.state.photo} />
                  }
                </div>
                {MAPHUBS_CONFIG.enableComments &&
                <div id='discussion' className='col s12' style={{height: 'calc(100% - 48px)'}}>
                  <Comments />
                </div>
                }
                <div id='notes' className='col s12' style={{position: 'relative', height: 'calc(100% - 48px)'}}>
                  <FeatureNotes editing={this.state.editingNotes} />
                  {notesEditButton}
                </div>
              </div>
            </div>
            <div className='col s6 no-padding'>
              <FeatureMap ref={(map) => { this.map = map }}
                geojson={this.props.feature} gpxLink={gpxLink} />
            </div>
          </div>
          {editButton}
        </main>
      </ErrorBoundary>
    )
  }
}
