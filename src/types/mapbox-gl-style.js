// @flow
import type {GeoJSONObject} from 'geojson-flow'

export type GLSource = {
  type: string, // 'vector' | 'raster' | 'geojson' | 'image' | 'video' | 'canvas' | 'arcgisraster',
  url?: string,
  tiles?: Array<string>,
  minzoom?: number,
  maxzoom?: number,
   metadata?: Object, // not actually part of the spec
  // type: raster
  tileSize?: number,
  // type: geojson
  data?: GeoJSONObject | string,
  buffer?: number,
  tolerance?: number,
  cluster?: boolean,
  clusterRadius?: number,
  clusterMaxZoom?: number,
  // types: image, video, canvas
  coordinates?: Array<number>,
  // types: video
  urls?: Array<string>,
  // type: canvas
  animate?: boolean,
  canvas?: string,
  mapboxid?: string
}

export type GLFilter = Array<any>

export type GLLayerLayout = {
  visibility?: 'visible' | 'none',
  [value: string]: any
}

export type GLLayerPaint = {
  [value: string]: any
}

export type GLSources = {
  [source: string]: GLSource
}

export type GLLayer = {
 id: string,
 type: string, // 'fill' | 'line' | 'symbol' | 'circle' | 'fill-extrusion' | 'raster' | 'background',
 metadata?: Object,
 ref?: string,
 source?: string,
 minzoom?: number,
 maxzoom?: number,
 filter?: GLFilter,
 layout?: GLLayerLayout,
 paint?: GLLayerPaint,
 [value: string]: any
}

export type GLLight = {
  anchor?: string, // 'map' | 'viewport',
  position?: Array<number>,
  color?: string,
  intensity?: number
}

export type GLTransition = {
  duration?: number,
  delay?: number
}

export type GLStyle = {
  version: number,
  name?: string,
  metadata?: Object,
  center?: Array<number>,
  zoom?: number,
  bearing?: number,
  pitch?: number,
  light?: GLLight,
  sources: GLSources,
  sprite?: string,
  glyphs?: string,
  transition?: GLTransition,
  layers: Array<GLLayer>
}
