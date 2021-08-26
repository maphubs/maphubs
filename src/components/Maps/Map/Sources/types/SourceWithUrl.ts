import { FeatureCollection } from 'geojson'

export type SourceWithUrl = mapboxgl.AnySourceData & {
  url?: string
  data?: FeatureCollection
  cluster?: boolean
  clusterMaxZoom?: number
  clusterRadius?: number
  metadata?: Record<string, unknown>
}
