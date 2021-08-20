import mapboxgl from 'mapbox-gl'
import { Labels } from '../components/LayerDesigner/LabelSettings'
import { LocalizedString } from './LocalizedString'
import { MapHubsField } from './maphubs-field'

export type Layer = {
  layer_id: number
  shortid: string
  name?: LocalizedString
  description?: LocalizedString
  source?: LocalizedString
  style?: mapboxgl.Style | null | undefined
  labels?: Labels
  settings?: {
    active: boolean
  }
  preview_position?: {
    zoom: number
    lat: number
    lng: number
    bbox: any
  }
  data_type?: string
  legend_html?: string | null | undefined
  license?: string
  owned_by_group_id: string
  private?: boolean
  is_external?: boolean
  external_layer_type?: string
  external_layer_config?: {
    data?: mapboxgl.GeoJSONSourceOptions['data']
    type?:
      | mapboxgl.Source['type']
      | 'ags-mapserver-query'
      | 'ags-mapserver-tiles'
      | 'ags-featureserver-query'
      | 'earthengine'
      | 'mapbox-style'
      | 'multiraster'
    url?: string
    layers?: mapboxgl.AnyLayer[]
    tiles?: Array<string>
    mapboxid?: string
    data_type?: string
  }
  is_empty?: boolean
  disable_export?: boolean
  allow_public_submit?: boolean
  remote?: boolean
  remote_host?: string
  remote_layer_id?: string
  complete?: boolean
  canEdit?: boolean
  presets?: MapHubsField[]
  last_updated: string
  creation_time: string
  created_by_user_id?: number
  updated_by_user_id?: number
  active?: boolean // only used on client-side to toggle certain layers
  published?: boolean
  extent_bbox?: [number, number, number, number]
}
