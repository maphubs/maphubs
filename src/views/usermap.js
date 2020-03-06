// @flow
import React from 'react'
import InteractiveMap from '../components/Map/InteractiveMap'
import Header from '../components/header'
import { Tooltip, Modal, message, notification } from 'antd'
import MapMakerActions from '../actions/MapMakerActions'
import UserStore from '../stores/UserStore'
import MapMakerStore from '../stores/MapMakerStore'
import debounce from 'lodash.debounce'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import fireResizeEvent from '../services/fire-resize-event'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {UserStoreState} from '../stores/UserStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import PublicShareModal from '../components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../components/ErrorBoundary'
import FloatingButton from '../components/FloatingButton'
import EmbedCodeModal from '../components/MapUI/EmbedCodeModal'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal

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

  componentDidMount () {
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    debounce(() => {
      fireResizeEvent()
    }, 300)
    if (this.state.user && !prevState.user) {
      M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
    }
  }

  onMouseEnterMenu = () => {
    // still needed?
  }

  onDelete = () => {
    const {t} = this
    const _this = this
    confirm({
      title: t('Confirm Deletion'),
      content: t('Please confirm deletion of ') + t(this.props.map.title),
      okText: t('Delete'),
      okType: 'danger',
      onOk () {
        MapMakerActions.deleteMap(_this.props.map.map_id, _this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            window.location = '/maps'
          }
        })
      }
    })
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
    const {map, publicShare} = this.props
    const {share_id, user, showEmbedCode} = this.state
    let deleteButton = ''
    let editButton = ''
    let shareButton = ''
    let shareModal = ''
    if (this.props.canEdit && !publicShare) {
      deleteButton = (
        <li>
          <FloatingButton
            color='red' icon='delete' large={false}
            onClick={this.onDelete} tooltip={t('Delete Map')}
          />
        </li>
      )
      editButton = (
        <li>
          <FloatingButton
            color='blue' icon='mode_edit' large={false}
            onClick={this.onEdit} tooltip={t('Edit Map')}
          />
        </li>
      )

      if (MAPHUBS_CONFIG.mapHubsPro && !publicShare) {
        shareButton = (
          <li>
            <FloatingButton
              color='green' icon='share' large={false}
              onClick={this.showSharePublic} tooltip={t('Share')}
            />
          </li>
        )
        shareModal = (
          <PublicShareModal ref='publicShareModal' map_id={map.map_id} share_id={share_id} _csrf={this.state._csrf} t={t} />
        )
      }
    }

    let copyButton = ''
    let copyModal = ''
    if (user && !publicShare) {
      copyButton = (
        <li>
          <FloatingButton
            color='purple' icon='queue' large={false}
            onClick={this.showCopyMap} tooltip={t('Copy Map')}
          />
        </li>
      )

      const copyMapTitle = JSON.parse(JSON.stringify(this.props.map.title))
      copyMapTitle.en = copyMapTitle.en + ' - Copy'
      // TODO: change copied map title in other languages

      copyModal = (
        <CopyMapModal ref='copyMapModal' title={copyMapTitle} map_id={map.map_id} _csrf={this.state._csrf} t={t} />
      )
    }

    const download = `${t(map.title)} - ${MAPHUBS_CONFIG.productName}.png`
    const downloadHREF = `/api/screenshot/map/${map.map_id}.png`

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
              <div
                ref={(ref) => { this.menuButton = ref }} id='user-map-button' className='fixed-action-btn' style={{bottom: '75px'}}
                onMouseEnter={this.onMouseEnterMenu}
              >
                <a className='btn-floating btn-large'>
                  <i className='large material-icons'>more_vert</i>
                </a>
                <ul>
                  {shareButton}
                  {deleteButton}
                  {editButton}
                  {copyButton}
                  <li>
                    <Tooltip
                      title={t('Get Map as a PNG Image')}
                      placement='left'
                    >
                      <a
                        onClick={this.download}
                        download={download} href={downloadHREF}
                        className='btn-floating green'
                      >
                        <i className='material-icons'>insert_photo</i>
                      </a>
                    </Tooltip>
                  </li>
                  <li>
                    <FloatingButton
                      color='orange' icon='code' large={false}
                      onClick={this.showEmbedCode} tooltip={t('Embed')}
                    />
                  </li>
                  <li>
                    <FloatingButton
                      color='yellow' icon='print' large={false}
                      onClick={this.onFullScreen} tooltip={t('Print/Screenshot')}
                    />
                  </li>
                </ul>
              </div>}
            {shareModal}
            {copyModal}
            {showEmbedCode &&
              <EmbedCodeModal show={showEmbedCode} map_id={map.map_id} share_id={share_id} onClose={() => { this.setState({showEmbedCode: false}) }} t={t} />}
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
