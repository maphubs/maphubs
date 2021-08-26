import { Context } from '../../types/graphqlContext'
import { LocalizedString } from '../../types/LocalizedString'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import MapModel from '../../models/map'
import GroupModel from '../../models/group'
import { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'
import { MapPosition } from '../../types/map'
import screenshotUtils from '../../services/screenshot-utils'
import knex from '../../connection'

const debug = DebugService('mutations/groups')

export default {
  async createMap(
    _: unknown,
    {
      group_id,
      layers,
      style,
      basemap,
      position,
      title,
      settings
    }: {
      group_id: string
      layers: string
      style: string
      position: string
      settings: string
      basemap: string
      title: string
    },
    context: Context
  ): Promise<{ map_id: number }> {
    const { user } = context
    const user_id = Number.parseInt(user.sub)
    if (group_id && basemap && position && settings && title) {
      if (await GroupModel.allowedToModify(group_id, user_id)) {
        return knex.transaction(async (trx) => {
          const map_id = await MapModel.createGroupMap(
            JSON.parse(layers) as Layer[],
            JSON.parse(style) as mapboxgl.Style,
            basemap,
            JSON.parse(position) as MapPosition,
            JSON.parse(title) as LocalizedString,
            JSON.parse(settings) as Record<string, unknown>,
            user_id,
            group_id,
            trx
          )
          // intentionally not returning here since we don't want to wait for the reload
          screenshotUtils.reloadMapThumbnail(map_id)
          screenshotUtils.reloadMapImage(map_id)
          return {
            map_id
          }
        })
      } else {
        throw new Error('Unauthorized')
      }
    } else {
      throw new Error('missing required data')
    }
  },
  async saveMap(
    _: unknown,
    {
      map_id,
      layers,
      style,
      basemap,
      position,
      title,
      settings
    }: {
      map_id: number
      layers: string
      style: string
      position: string
      settings: string
      basemap: string
      title: string
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    const user_id = Number.parseInt(user.sub)

    if (layers && style && settings && basemap && position && map_id && title) {
      if (await MapModel.allowedToModify(map_id, user_id)) {
        await MapModel.updateMap(
          map_id,
          JSON.parse(layers) as Layer[],
          JSON.parse(style) as mapboxgl.Style,
          basemap,
          JSON.parse(position) as MapPosition,
          JSON.parse(title) as LocalizedString,
          JSON.parse(settings) as Record<string, unknown>,
          user_id
        )
        // don't wait for screenshot
        screenshotUtils.reloadMapThumbnail(map_id)
        screenshotUtils.reloadMapImage(map_id)
        return true
      } else {
        throw new Error('you do not have permission to modify this map')
      }
    } else {
      throw new Error('missing required data')
    }
  },
  async deleteMap(
    _: unknown,
    {
      map_id
    }: {
      map_id: number
    },
    context: Context
  ): Promise<boolean> {
    const { user } = context
    if (map_id) {
      if (await MapModel.allowedToModify(map_id, Number.parseInt(user.sub))) {
        await MapModel.deleteMap(map_id)
        return true
      } else {
        throw new Error('you do not have permission to modify this map')
      }
    } else {
      throw new Error('map_id required')
    }
  },
  async copyMap(
    _: unknown,
    {
      map_id,
      group_id,
      title
    }: {
      map_id: number
      group_id: string
      title: LocalizedString
    },
    context: Context
  ): Promise<{ map_id: number }> {
    const { user } = context
    const user_id = Number.parseInt(user.sub)

    if (map_id && group_id) {
      // copy to a group
      if (await GroupModel.allowedToModify(group_id, user_id)) {
        const copy_id = await MapModel.copyMapToGroup(
          map_id,
          group_id,
          user_id,
          title
        )
        // don't wait for screenshot
        screenshotUtils.reloadMapThumbnail(copy_id)
        screenshotUtils.reloadMapImage(copy_id)
        return {
          map_id: copy_id
        }
      } else {
        throw new Error('you do not have permission to modify this group')
      }
    } else {
      throw new Error('missing required data')
    }
  },
  async setMapPublic(
    _: unknown,
    {
      map_id,
      isPublic
    }: {
      map_id: number
      isPublic: boolean
    },
    context: Context
  ): Promise<string> {
    const { user } = context
    if (map_id && typeof isPublic !== 'undefined') {
      if (await MapModel.allowedToModify(map_id, Number.parseInt(user.sub))) {
        if (isPublic) {
          return await MapModel.addPublicShareID(map_id)
        } else {
          await MapModel.removePublicShareID(map_id)
          return ''
        }
      } else {
        throw new Error('you do not have permission to modify this map')
      }
    } else {
      throw new Error('map_id required')
    }
  }
}
