import { BBox, Feature as GeoJSONFeature } from 'geojson'
import { Layer } from './layer'

export type Feature = {
  name: string
  type: string
  features: GeoJSONFeature[]
  layer_id: number
  bbox: BBox
  mhid: string
}

export type FeatureInfo = {
  feature: Feature
  notes: string
  photo: Record<string, any>
  layer: Layer
  canEdit: boolean
}
