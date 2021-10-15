import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { useSession, getSession } from 'next-auth/client'
import Layout from '../../../src/components/Layout'
import { message } from 'antd'
import PublicShareModal from '../../../src/components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../../../src/components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import EmbedCodeModal from '../../../src/components/MapUI/EmbedCodeModal'
import QueueIcon from '@material-ui/icons/Queue'
import PhotoIcon from '@material-ui/icons/Photo'
import CodeIcon from '@material-ui/icons/Code'
import PrintIcon from '@material-ui/icons/Print'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import ShareIcon from '@material-ui/icons/Share'
import { Fab, Action } from 'react-tiny-fab'
import 'react-tiny-fab/dist/styles.css'
import MapProvider from '../../../src/components/Maps/redux/MapProvider'
import useT from '../../../src/hooks/useT'
import { Map } from '../../../src/types/map'
import { Layer } from '../../../src/types/layer'
import dynamic from 'next/dynamic'

//SSR Only
import MapModel from '../../../src/models/map'
import PageModel from '../../../src/models/page'

const InteractiveMap = dynamic(
  () => import('../../../src/components/Maps/Map/InteractiveMap'),
  {
    ssr: false
  }
)

type UserMapState = {
  share_id?: string
  showEmbedCode?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const map_id = Number.parseInt(context.params.usermap[0])
  const map = await MapModel.getMap(map_id)
  if (!map) {
    return {
      notFound: true
    }
  }

  const session = await getSession(context)
  let allowedToModifyMap = null
  if (session?.user) {
    allowedToModifyMap = await MapModel.allowedToModify(
      map_id,
      Number.parseInt(session.sub)
    )
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      map,
      mapLayers: await MapModel.getMapLayers(map_id),
      mapConfig,
      allowedToModifyMap
    }
  }
}

const UserMap = ({
  map,
  mapLayers,
  allowedToModifyMap,
  mapConfig
}: {
  map: Map
  mapLayers: Layer[]
  allowedToModifyMap: boolean
  mapConfig: Record<string, unknown>
}): JSX.Element => {
  const publicShare = false // TODO: support public share map
  const [session] = useSession()
  const router = useRouter()
  const { t, locale } = useT()
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [showCopyMap, setShowCopyMap] = useState(false)
  const [showPublicShare, setShowPublicShare] = useState(false)

  const onEdit = (): void => {
    router.push('/map/edit/' + map.map_id)
  }
  const onFullScreen = (): void => {
    let fullScreenLink = `/map/screenshot/${map.map_id}`

    if (window.location.hash) {
      fullScreenLink = fullScreenLink += window.location.hash
    }

    router.push(fullScreenLink)
  }

  const download = (): void => {
    if (!map.has_screenshot) {
      // warn the user if we need to wait for the screenshot to be created
      const closeMessage = message.loading(t('Downloading'), 0)
      setTimeout(() => {
        closeMessage()
      }, 15_000)
    }
  }

  console.log(map)

  return (
    <ErrorBoundary t={t}>
      {map && (
        <Layout title={t(map.title)} hideFooter>
          <div
            style={{
              height: '100%',
              marginTop: 0
            }}
          >
            <MapProvider>
              <InteractiveMap
                height='100%'
                {...map}
                title={map.title}
                position={map.position}
                basemap={map.basemap}
                style={map.style}
                layers={mapLayers}
                mapConfig={mapConfig}
                disableScrollZoom={false}
                primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
                earthEngineClientID={
                  process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID
                }
                {...map.settings}
                locale={locale}
              />
            </MapProvider>
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
                  backgroundColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR
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
                  onClick={() => {
                    setShowEmbedCode(true)
                  }}
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
                    process.env.NEXT_PUBLIC_PRODUCT_NAME
                  }.png`}
                  href={`/api/screenshot/map/${map.map_id}.png`}
                >
                  <PhotoIcon />
                </Action>
                {session?.user && !publicShare && (
                  <Action
                    text={t('Copy Map')}
                    style={{
                      backgroundColor: 'purple'
                    }}
                    onClick={() => {
                      setShowCopyMap(true)
                    }}
                  >
                    <QueueIcon />
                  </Action>
                )}
                {allowedToModifyMap && !publicShare && (
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
                {allowedToModifyMap &&
                  process.env.NEXT_PUBLIC_MAPHUBS_PRO === 'true' &&
                  !publicShare && (
                    <Action
                      text={t('Share')}
                      style={{
                        backgroundColor: 'red'
                      }}
                      onClick={() => {
                        setShowPublicShare(true)
                      }}
                    >
                      <ShareIcon />
                    </Action>
                  )}
              </Fab>
            )}
            {allowedToModifyMap &&
              process.env.NEXT_PUBLIC_MAPHUBS_PRO === 'true' &&
              !publicShare && (
                <PublicShareModal
                  visible={showPublicShare}
                  map_id={map.map_id}
                  share_id={map.share_id}
                  onClose={() => {
                    setShowPublicShare(false)
                  }}
                />
              )}
            {session?.user && !publicShare && (
              <CopyMapModal
                visible={showCopyMap}
                onClose={() => {
                  setShowCopyMap(false)
                }}
                title={map.title}
                map_id={map.map_id}
              />
            )}
            {showEmbedCode && (
              <EmbedCodeModal
                show={showEmbedCode}
                map_id={map.map_id}
                share_id={map.share_id}
                onClose={() => {
                  setShowEmbedCode(false)
                }}
              />
            )}
          </div>
        </Layout>
      )}
    </ErrorBoundary>
  )
}
export default UserMap
