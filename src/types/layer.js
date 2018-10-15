// @flow
import type {GLStyle} from './mapbox-gl-style'

export type Layer = {
  layer_id?: number,
  shortid?: string,
  name?: LocalizedString,
  description?: LocalizedString,
  source?: LocalizedString,
  style?: ?GLStyle,
  labels?: Object,
  settings?: {
    active: boolean
  },
  preview_position?: {bbox: any},
  data_type?: string,
  legend_html?: ?string,
  license?: string,
  owned_by_group_id?: string,
  private?: boolean,
  is_external?: boolean,
  external_layer_type?: string,
  external_layer_config?: {
    type?: 'ags-mapserver-tiles' | 'multiraster' | 'raster' | 'mapbox-style' | 'vector' | 'ags-featureserver-query' | 'ags-mapserver-query' | 'earthengine',
    url?: string,
    layers?: Array<Object>,
    tiles?: Array<string>
    },
  is_empty?: boolean,
  disable_export?: boolean,
  allow_public_submit?: boolean,
  disable_feature_indexing?: boolean,
  remote?: boolean,
  remote_host?: string,
  remote_layer_id?: string,
  complete?: boolean,
  canEdit?: boolean,
  presets?: any
}
