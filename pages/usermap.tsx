import React from 'react'
import InteractiveMap from '../src/components/Map/InteractiveMap'
import Header from '../src/components/header'
import { message } from 'antd'
import UserStore from '../src/stores/UserStore'
import MapMakerStore from '../src/stores/MapMakerStore'

import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import PublicShareModal from '../src/components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../src/components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../src/components/ErrorBoundary'
import EmbedCodeModal from '../src/components/MapUI/EmbedCodeModal'
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
  map: Record<string, any>
  layers: Array<Record<string, any>>
  canEdit: boolean
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
  publicShare: boolean
}
type UserMapState = {
  share_id?: string
  showEmbedCode?: boolean
}
type State = UserMapState
export default class UserMap extends React.Component<Props, State> {
  BaseMapState: any
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

  static defaultProps:
    | any
    | {
        canEdit: boolean
      } = {
    canEdit: false
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore, MapMakerStore]
    this.state = {
      share_id: props.map.share_id
    }

    const baseMapContainerInit: {
      baseMap: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
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
  }

  onEdit = (): void => {
    window.location.assign('/map/edit/' + this.props.map.map_id) // CreateMapActions.showMapDesigner();
  }
  onFullScreen = (): void => {
    let fullScreenLink = `/api/map/${this.props.map.map_id}/static/render?showToolbar=1`

    if (window.location.hash) {
      fullScreenLink = fullScreenLink += window.location.hash
    }

    window.location.assign(fullScreenLink)
  }
  onMapChanged = (): void => {
    location.reload()
  }
  download = (): void => {
    if (!this.props.map.has_screenshot) {
      // warn the user if we need to wait for the screenshot to be created
      const closeMessage = message.loading(this.t('Downloading'), 0)
      setTimeout(() => {
        closeMessage()
      }, 15000)
    }
  }
  showEmbedCode = (): void => {
    this.setState({
      showEmbedCode: true
    })
  }
  showSharePublic = (): void => {
    this.refs.publicShareModal.show()
  }
  showCopyMap = (): void => {
    this.refs.copyMapModal.show()
  }

  render(): JSX.Element {
    const {
      t,
      showSharePublic,
      onEdit,
      onFullScreen,
      props,
      state,
      BaseMapState,
      download,
      showCopyMap
    } = this
    const { map, publicShare, canEdit, headerConfig, layers, mapConfig } = props
    const { share_id, user, showEmbedCode, _csrf } = state
    const copyMapTitle = JSON.parse(JSON.stringify(map.title))
    // TODO: change copied map title in other languages
    copyMapTitle.en = `${copyMapTitle.en} - Copy`
    return (
      <ErrorBoundary t={t}>
        <Provider inject={[BaseMapState]}>
          <Header {...headerConfig} />
          <main
            style={{
              height: 'calc(100% - 50px)',
              marginTop: 0
            }}
          >
            <InteractiveMap
              height='calc(100vh - 50px)'
              {...map}
              layers={layers}
              mapConfig={mapConfig}
              disableScrollZoom={false}
              primaryColor={MAPHUBS_CONFIG.primaryColor}
              logoSmall={MAPHUBS_CONFIG.logoSmall}
              logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
              logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
              mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
              earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              {...map.settings}
              t={t}
            />
            <style jsx global>
              {`
                .rtf {
                  z-index: 999 !important;
                }
              `}
            </style>
            {!publicShare && (
              <Fab
                mainButtonStyles={{
                  backgroundColor: MAPHUBS_CONFIG.primaryColor
                }}
                position={{
                  bottom: 75,
                  right: 0
                }}
                event='click'
                icon={<MoreVertIcon />}
              >
                <Action
                  text={t('Print/Screenshot')}
                  style={{
                    backgroundColor: 'grey'
                  }}
                  onClick={onFullScreen}
                >
                  <PrintIcon />
                </Action>
                <Action
                  text={t('Embed')}
                  style={{
                    backgroundColor: 'orange'
                  }}
                  onClick={this.showEmbedCode}
                >
                  <CodeIcon />
                </Action>
                <Action
                  text={t('Get Map as a PNG Image')}
                  style={{
                    backgroundColor: 'green'
                  }}
                  onClick={download}
                  download={`${t(map.title)} - ${
                    MAPHUBS_CONFIG.productName
                  }.png`}
                  href={`/api/screenshot/map/${map.map_id}.png`}
                >
                  <PhotoIcon />
                </Action>
                {user && !publicShare && (
                  <Action
                    text={t('Copy Map')}
                    style={{
                      backgroundColor: 'purple'
                    }}
                    onClick={showCopyMap}
                  >
                    <QueueIcon />
                  </Action>
                )}
                {canEdit && !publicShare && (
                  <Action
                    text={t('Edit Map')}
                    style={{
                      backgroundColor: 'blue'
                    }}
                    onClick={onEdit}
                  >
                    <EditIcon />
                  </Action>
                )}
                {canEdit && MAPHUBS_CONFIG.mapHubsPro && !publicShare && (
                  <Action
                    text={t('Share')}
                    style={{
                      backgroundColor: 'red'
                    }}
                    onClick={showSharePublic}
                  >
                    <ShareIcon />
                  </Action>
                )}
              </Fab>
            )}
            {canEdit && MAPHUBS_CONFIG.mapHubsPro && !publicShare && (
              <PublicShareModal
                ref='publicShareModal'
                map_id={map.map_id}
                share_id={share_id}
                _csrf={_csrf}
              />
            )}
            {user && !publicShare && (
              <CopyMapModal
                ref='copyMapModal'
                title={copyMapTitle}
                map_id={map.map_id}
                _csrf={_csrf}
                t={t}
              />
            )}
            {showEmbedCode && (
              <EmbedCodeModal
                show={showEmbedCode}
                map_id={map.map_id}
                share_id={share_id}
                onClose={() => {
                  this.setState({
                    showEmbedCode: false
                  })
                }}
              />
            )}
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
