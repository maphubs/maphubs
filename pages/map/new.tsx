import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/client'
import Layout from '../../src/components/Layout'
import slugify from 'slugify'
import { message, notification } from 'antd'

import ErrorBoundary from '../../src/components/ErrorBoundary'
import type { Layer } from '../../src/types/layer'
import type { Group } from '../../src/types/group'

import { LocalizedString } from '../../src/types/LocalizedString'
import useT from '../../src/hooks/useT'

import dynamic from 'next/dynamic'
import { MapMakerState } from '../../src/components/Maps/redux/reducers/mapMakerSlice'
import MapProvider from '../../src/components/Maps/redux/MapProvider'
const MapMaker = dynamic(
  () => import('../../src/components/Maps/MapMaker/MapMaker'),
  {
    ssr: false
  }
)

//SSR Only
import LayerModel from '../../src/models/layer'
import PageModel from '../../src/models/page'
import GroupModel from '../../src/models/group'

type Props = {
  popularLayers: Array<Layer>
  myLayers: Array<Layer>
  groups: Array<Group>
  editLayer: Record<string, any>
  mapConfig: Record<string, any>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const user_id = session.user.id || session.user.sub

  const popularLayers = await LayerModel.getPopularLayers()
  let myLayers = []
  let groups = []
  let editLayer = null
  if (user_id) {
    await LayerModel.attachPermissionsToLayers(popularLayers, user_id)
    myLayers = await LayerModel.getUserLayers(user_id, 50)
    await LayerModel.attachPermissionsToLayers(myLayers, user_id)
    const editLayerId = Number.parseInt(context.query.editlayer as string)

    groups = await GroupModel.getGroupsForUser(user_id)

    if (editLayerId) {
      const allowed = await LayerModel.allowedToModify(editLayerId, user_id)

      if (allowed) {
        editLayer = await LayerModel.getLayerByID(editLayerId)

        if (editLayer) {
          editLayer.canEdit = true
        }
      }
    }
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      popularLayers,
      myLayers,
      groups,
      mapConfig,
      editLayer
    }
  }
}

const NewMap = ({
  popularLayers,
  myLayers,
  editLayer,
  mapConfig,
  groups
}: Props): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  /*
  constructor(props: Props) {
    super(props)

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

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }
  */

  const mapCreated = (mapId: number, title: LocalizedString): void => {
    router.push('/map/view/' + mapId + '/' + slugify(t(title)))
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('New Map')} activePage='map' hideFooter>
        <div
          style={{
            height: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <MapProvider>
            <MapMaker
              mapConfig={mapConfig}
              onSave={(mapMakerState: MapMakerState) => {
                // TODO: call mutation to save map
                setSaved(true)
              }}
              onCreate={(mapMakerState: MapMakerState) => {
                // TODO: call mutation to create map
              }}
              onDelete={(map_id: number) => {
                // TODO: call mutation to delete map
                /*
              Actions.deleteMap(map_id, (err) => {
                if (err) {
                  notification.error({
                    message: t('Error'),
                    description: err.message || err.toString() || err,
                    duration: 0
                  })
                } else {
                  router.push('/maps')
                }
              })
              */
              }}
              popularLayers={popularLayers}
              myLayers={myLayers}
              editLayer={editLayer}
              groups={groups}
              locale={locale}
            />
          </MapProvider>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default NewMap
