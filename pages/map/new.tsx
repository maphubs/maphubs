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
import { MapPosition } from '../../src/types/map'

import { LocalizedString } from '../../src/types/LocalizedString'
import useT from '../../src/hooks/useT'
import mutation from '../../src/graphql/graphql-mutation'
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
  const user_id = Number.parseInt(session.sub)

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
              onSave={async ({
                map_id,
                layers,
                style,
                settings,
                title,
                position,
                basemap
              }: {
                map_id: number
                layers: Layer[]
                style: mapboxgl.Style
                settings: Record<string, unknown>
                title: LocalizedString
                position: MapPosition
                basemap: string
              }) => {
                try {
                  const result = await mutation(`
                      saveMap(
                        map_id: ${map_id},
                        layers: "${layers}", 
                        style: "${style}",   
                        position: "${position}", 
                        settings: "${settings}", 
                        basemap: "${basemap}",
                        title: "${title}"
                      )
                    `)
                  const mapId = result.createMap.map_id
                  message.success(t('Map Created'), 1)
                  setSaved(true)
                  router.push('/map/view/' + mapId + '/' + slugify(t(title)))
                  return true
                } catch (err) {
                  notification.error({
                    message: t('Server Error'),
                    description: err.message || err.toString(),
                    duration: 0
                  })
                }
              }}
              onCreate={async ({
                group_id,
                layers,
                style,
                settings,
                title,
                position,
                basemap
              }: {
                group_id: string
                layers: Layer[]
                style: mapboxgl.Style
                settings: Record<string, unknown>
                title: LocalizedString
                position: MapPosition
                basemap: string
              }) => {
                try {
                  const result = await mutation(`
                      createMap(
                        group_id: "${group_id}",
                        layers: ${JSON.stringify(JSON.stringify(layers))}, 
                        style: ${JSON.stringify(JSON.stringify(style))},   
                        position: ${JSON.stringify(JSON.stringify(position))}, 
                        settings: ${JSON.stringify(JSON.stringify(settings))}, 
                        basemap: "${basemap}",
                        title: ${JSON.stringify(JSON.stringify(title))}
                      ) {
                        map_id
                      }
                    `)
                  const mapId = result.createMap.map_id
                  message.success(t('Map Created'), 1)

                  router.push('/map/view/' + mapId + '/' + slugify(t(title)))
                  return mapId
                } catch (err) {
                  notification.error({
                    message: t('Server Error'),
                    description: err.message || err.toString(),
                    duration: 0
                  })
                }
              }}
              onDelete={async (map_id: number) => {
                try {
                  await mutation(`
                  deleteMap(map_id: ${map_id})
                    `)
                  router.push('/maps')
                  return true
                } catch (err) {
                  notification.error({
                    message: t('Server Error'),
                    description: err.message || err.toString(),
                    duration: 0
                  })
                }
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
