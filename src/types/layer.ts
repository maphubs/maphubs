import mapboxgl from 'mapbox-gl'
import { LocalizedString } from './LocalizedString'

export type Layer = {
  layer_id?: number
  shortid?: string
  name?: LocalizedString
  description?: LocalizedString
  source?: LocalizedString
  style?: mapboxgl.Style | null | undefined
  labels?: Record<string, any>
  settings?: {
    active: boolean
  }
  preview_position?: {
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
    type?:
      | 'multiraster'
      | 'raster'
      | 'mapbox-style'
      | 'vector'
      | 'ags-featureserver-query'
      | 'ags-mapserver-query'
      | 'earthengine'
      | 'ags-mapserver-tiles'
    url?: string
    layers?: Array<Record<string, any>>
    tiles?: Array<string>
  }
  is_empty?: boolean
  disable_export?: boolean
  allow_public_submit?: boolean
  disable_feature_indexing?: boolean
  remote?: boolean
  remote_host?: string
  remote_layer_id?: string
  complete?: boolean
  canEdit?: boolean
  presets?: any
  last_updated?: string
  created_by_user_id?: number
  updated_by_user_id?: number
}
