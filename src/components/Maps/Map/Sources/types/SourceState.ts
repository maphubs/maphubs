import mapboxgl from 'mapbox-gl'
import { SourceWithUrl } from './SourceWithUrl'

export type SourceState = {
  editing: boolean
  allowLayersToMoveMap: boolean
  mapboxMap: mapboxgl.Map & { authUrlStartsWith?: string; authToken?: string }
  addLayer: (layer: mapboxgl.Layer, position: number) => void
  addLayerBefore: (layer: mapboxgl.Layer, before: string) => void
  addSource: (key: string, source: SourceWithUrl) => void
}
