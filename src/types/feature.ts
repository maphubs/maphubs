import { BBox, Feature } from 'geojson'
import { Layer } from './layer'
import { LocalizedString } from './LocalizedString'

export type FeatureInfo = {
  feature: {
    name: string
    type: string
    features: Feature[]
    layer_id: number
    bbox: BBox
    mhid: string
  }
  notes: string
  photo: Record<string, any>
  layer: Layer
  canEdit: boolean
}
