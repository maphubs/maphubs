import mapboxgl from 'mapbox-gl'
import { LocalizedString } from './LocalizedString'

export type MapPosition = {
  bbox: number[][] // while we call this bbox it is actually the mapbox-gl bounds format
  lat: number
  lng: number
  zoom: number
}

export type Map = {
  map_id: number
  title: LocalizedString
  position: MapPosition
  style: mapboxgl.Style
  settings: Record<string, unknown>
  basemap: string
  created_at?: string
  updated_at?: string
  views?: number
  owned_by_group_id: string
  share_id?: string
  has_screenshot?: boolean
}
