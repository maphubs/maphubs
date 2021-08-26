import { BBox, Feature as GeoJSONFeature } from 'geojson'

export type Feature = {
  name: string
  type: string
  features: GeoJSONFeature[]
  layer_id: number
  bbox: BBox
  mhid: string
}
