import React from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import Layout from '../../../src/components/Layout'
import slugify from 'slugify'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import type { Layer } from '../../../src/types/layer'
import type { Group } from '../../../src/types/group'
import { LocalizedString } from '../../../src/types/LocalizedString'
import useT from '../../../src/hooks/useT'
import { Map } from '../../../src/types/map'
import dynamic from 'next/dynamic'
import mutation from '../../../src/graphql/graphql-mutation'
import { message, notification } from 'antd'
import { MapPosition } from '../../../src/types/map'
import MapProvider from '../../../src/components/Maps/redux/MapProvider'

//SSR Only
import MapModel from '../../../src/models/map'
import LayerModel from '../../../src/models/layer'
import PageModel from '../../../src/models/page'
import GroupModel from '../../../src/models/group'

const MapMaker = dynamic(
  () => import('../../../src/components/Maps/MapMaker/MapMaker'),
  {
    ssr: false
  }
)

export const getServerSideProps: GetServerSideProps = async (context) => {
  const map_id = Number.parseInt(context.params.mapedit[0])
  const session = await getSession(context)
  const user_id = Number.parseInt(session.sub)

  const allowedToModify = await MapModel.allowedToModify(map_id, user_id)
  if (!allowedToModify) {
    return {
      notFound: true
    }
  }

  const map = await MapModel.getMap(map_id)

  const popularLayers = await LayerModel.getPopularLayers()
  let myLayers = []
  let groups = []

  if (user_id) {
    await LayerModel.attachPermissionsToLayers(popularLayers, user_id)
    myLayers = await LayerModel.getUserLayers(user_id, 50)
    await LayerModel.attachPermissionsToLayers(myLayers, user_id)
    groups = await GroupModel.getGroupsForUser(user_id)
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      map,
      mapLayers: await MapModel.getMapLayers(map.map_id),
      popularLayers,
      myLayers,
      groups,
      mapConfig
    }
  }
}

const MapEdit = ({
  map,
  mapLayers,
  popularLayers,
  myLayers,
  groups,
  mapConfig
}: {
  map: Map
  mapLayers: Layer[]
  popularLayers: Layer[]
  myLayers: Layer[]
  groups: Group[]
  mapConfig: Record<string, unknown>
}): JSX.Element => {
  const router = useRouter()
  const { t, locale } = useT()

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Edit Map')} hideFooter>
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
                  await mutation(`
                    saveMap(
                      map_id: ${map_id},
                      layers: ${JSON.stringify(JSON.stringify(layers))}, 
                      style: ${JSON.stringify(JSON.stringify(style))},   
                      position: ${JSON.stringify(JSON.stringify(position))}, 
                      settings: ${JSON.stringify(JSON.stringify(settings))}, 
                      basemap: "${basemap}",
                      title: ${JSON.stringify(JSON.stringify(title))}
                    )
                  `)
                  message.success(t('Map Saved'), 1)
                  router.push('/map/view/' + map_id + '/' + slugify(t(title)))
                  return true
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
              mapLayers={mapLayers}
              basemap={map.basemap}
              map_id={map.map_id}
              title={map.title}
              owned_by_group_id={map.owned_by_group_id}
              position={map.position}
              settings={map.settings}
              popularLayers={popularLayers}
              myLayers={myLayers}
              groups={groups}
              edit
              locale={locale}
            />
          </MapProvider>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default MapEdit
