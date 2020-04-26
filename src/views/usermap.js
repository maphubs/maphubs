// @flow
import React from 'react'
import InteractiveMap from '../components/Map/InteractiveMap'
import Header from '../components/header'
import { message } from 'antd'
import UserStore from '../stores/UserStore'
import MapMakerStore from '../stores/MapMakerStore'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {UserStoreState} from '../stores/UserStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import PublicShareModal from '../components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../components/ErrorBoundary'
import EmbedCodeModal from '../components/MapUI/EmbedCodeModal'
import QueueIcon from '@material-ui/icons/Queue'
import PhotoIcon from '@material-ui/icons/Photo'
import CodeIcon from '@material-ui/icons/Code'
import PrintIcon from '@material-ui/icons/Print'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import ShareIcon from '@material-ui/icons/Share'
import { Fab, Action } from 'react-tiny-fab'
import 'react-tiny-fab/dist/styles.css'

import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  map: Object,
  layers: Array<Object>,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object,
  publicShare: boolean
}

type UserMapState = {
  share_id?: string,
  showEmbedCode?: boolean
}

type State = LocaleStoreState & UserStoreState & UserMapState

export default class UserMap extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
    this.stores.push(MapMakerStore)
    this.state = {}
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    const baseMapContainerInit: {
      baseMap: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
    } = {
      baseMap: props.map.basemap,
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (props.map.share_id) {
      this.state.share_id = props.map.share_id
    }
  }

  onEdit = () => {
    window.location = '/map/edit/' + this.props.map.map_id
    // CreateMapActions.showMapDesigner();
  }

  onFullScreen = () => {
    let fullScreenLink = `/api/map/${this.props.map.map_id}/static/render?showToolbar=1`
    if (window.location.hash) {
      fullScreenLink = fullScreenLink += window.location.hash
    }
    window.location = fullScreenLink
  }

  onMapChanged = () => {
    location.reload()
  }

  download = () => {
    if (!this.props.map.has_screenshot) {
      // warn the user if we need to wait for the screenshot to be created
      const closeMessage = message.loading(this.t('Downloading'), 0)
      setTimeout(() => { closeMessage() }, 15000)
    }
  }

  showEmbedCode = () => {
    this.setState({showEmbedCode: true})
  }

  showSharePublic = () => {
    this.refs.publicShareModal.show()
  }

  showCopyMap = () => {
    this.refs.copyMapModal.show()
  }

  render () {
    const {t} = this
    const {map, publicShare, canEdit} = this.props
    const {share_id, user, showEmbedCode} = this.state

    const copyMapTitle = JSON.parse(JSON.stringify(this.props.map.title))
    // TODO: change copied map title in other languages
    copyMapTitle.en = `${copyMapTitle.en} - Copy`

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
            <InteractiveMap
              height='calc(100vh - 50px)'
              {...map}
              layers={this.props.layers}
              mapConfig={this.props.mapConfig}
              disableScrollZoom={false}
              primaryColor={MAPHUBS_CONFIG.primaryColor}
              logoSmall={MAPHUBS_CONFIG.logoSmall}
              logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
              logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
              mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
              earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              {...map.settings}
              t={this.t}
            />
            {!publicShare &&
              <Fab
                mainButtonStyles={{backgroundColor: MAPHUBS_CONFIG.primaryColor}}
                position={{bottom: 75, right: 0}}
                icon={<MoreVertIcon />}
              >
                <Action
                  text={t('Print/Screenshot')}
                  style={{backgroundColor: 'grey'}}
                  onClick={this.onFullScreen}
                >
                  <PrintIcon />
                </Action>
                <Action
                  text={t('Embed')}
                  style={{backgroundColor: 'orange'}}
                  onClick={this.showEmbedCode}
                >
                  <CodeIcon />
                </Action>
                <Action
                  text={t('Get Map as a PNG Image')}
                  style={{backgroundColor: 'green'}}
                  onClick={this.download}
                  download={`${t(map.title)} - ${MAPHUBS_CONFIG.productName}.png`}
                  href={`/api/screenshot/map/${map.map_id}.png`}
                >
                  <PhotoIcon />
                </Action>
                {(user && !publicShare) &&
                  <Action
                    text={t('Copy Map')}
                    style={{backgroundColor: 'purple'}}
                    onClick={this.showCopyMap}
                  >
                    <QueueIcon />
                  </Action>}
                {(canEdit && !publicShare) &&
                  <Action
                    text={t('Edit Map')}
                    style={{backgroundColor: 'blue'}}
                    onClick={this.onEdit}
                  >
                    <EditIcon />
                  </Action>}
                {(canEdit && MAPHUBS_CONFIG.mapHubsPro && !publicShare) &&
                  <Action
                    text={t('Share')}
                    style={{backgroundColor: 'red'}}
                    onClick={this.showSharePublic}
                  >
                    <ShareIcon />
                  </Action>}
              </Fab>}
            {(canEdit && MAPHUBS_CONFIG.mapHubsPro && !publicShare) &&
              <PublicShareModal ref='publicShareModal' map_id={map.map_id} share_id={share_id} _csrf={this.state._csrf} t={t} />}
            {(user && !publicShare) &&
              <CopyMapModal ref='copyMapModal' title={copyMapTitle} map_id={map.map_id} _csrf={this.state._csrf} t={t} />}
            {showEmbedCode &&
              <EmbedCodeModal show={showEmbedCode} map_id={map.map_id} share_id={share_id} onClose={() => { this.setState({showEmbedCode: false}) }} t={t} />}
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
