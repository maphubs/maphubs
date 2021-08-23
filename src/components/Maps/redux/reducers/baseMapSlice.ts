import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { LocalizedString } from '../../../../types/LocalizedString'
import _bboxPolygon from '@turf/bbox-polygon'
import _intersect from '@turf/intersect'
import _debounce from 'lodash.debounce'
import _distance from '@turf/distance'
import _find from 'lodash.find'

import defaultBaseMapOptions from '../../Map/BaseMaps/base-map-options.json'

import DebugService from '../../lib/debug'
import { MapPosition } from '../../../../types/map'
import { Point } from 'geojson'
import mapboxgl from 'mapbox-gl'
import type { AppState } from '../store'

const debug = DebugService('BaseMapReducer')

export type BaseMapOption = {
  value: string
  label: LocalizedString
  attribution: string
  updateWithMapPosition: boolean
  style: Record<string, any>
  loadFromFile: string
  icon?: string
}
export type BaseMapState = {
  baseMap: string
  baseMapStyle?: mapboxgl.Style
  attribution: string
  bingImagerySet?: string
  updateWithMapPosition: boolean
  baseMapOptions: Array<BaseMapOption>
  bingKey?: string
  mapboxAccessToken: string
  position?: MapPosition
}

const initialState: BaseMapState = {
  baseMap: 'default',
  attribution: '© Mapbox © OpenStreetMap',
  updateWithMapPosition: false,
  baseMapOptions: defaultBaseMapOptions as unknown as BaseMapOption[],
  mapboxAccessToken: ''
}

const getBaseMapStyle = async (
  state: BaseMapState,
  baseMap: string
): Promise<{
  baseMapStyle: BaseMapState['baseMapStyle']
  attribution?: string
  updateWithMapPosition?: boolean
  bingImagerySet?: string
}> => {
  const { mapboxAccessToken, baseMapOptions } = state

  const config = _find(baseMapOptions, {
    value: baseMap
  })

  if (config) {
    if (baseMap === 'bing-satellite') {
      // const bingMetadata = await this.getBingSource('Aerial')

      const style = config.style

      if (!style.glyphs) {
        style.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
      }

      if (!style.sprite) {
        style.sprite = ''
      }

      return {
        baseMapStyle: style,
        attribution: config.attribution,
        updateWithMapPosition: config.updateWithMapPosition,
        bingImagerySet: 'Aerial'
      }
    } else if (config.style) {
      const style = config.style

      if (typeof style !== 'string') {
        if (!style.glyphs) {
          style.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
        }

        if (!style.sprite) {
          style.sprite = ''
        }
      }

      return {
        baseMapStyle: style,
        attribution: config.attribution,
        updateWithMapPosition: config.updateWithMapPosition
      }
    } else if (config.url) {
      try {
        const response = await fetch(config.url)
        const result = await response.json()
        const style = result.body

        if (!style.glyphs) {
          style.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
        }

        if (!style.sprite) {
          style.sprite = ''
        }

        return {
          baseMapStyle: style,
          attribution: config.attribution,
          updateWithMapPosition: config.updateWithMapPosition
        }
      } catch (err) {
        debug.error(err)
      }
    } else if (config.mapboxUrl) {
      // example: mapbox://styles/mapbox/streets-v8?optimize=true
      // converted to: //https://api.mapbox.com/styles/v1/mapbox/streets-v9?access_token=
      let url = config.mapboxUrl.replace(
        'mapbox://styles/',
        'https://api.mapbox.com/styles/v1/'
      )

      url = `${url}${
        config.mapboxUrl.endsWith('?optimize=true') ? '&' : '?'
      }access_token=${mapboxAccessToken}`

      try {
        const response = await fetch(url)
        const result = await response.json()
        return {
          baseMapStyle: result,
          attribution: config.attribution,
          updateWithMapPosition: config.updateWithMapPosition
        }
      } catch (err) {
        debug.error(err)
      }
    } else {
      debug.log(`map style not found for base map: ${baseMap}`)
    }
  } else {
    console.error(`unknown base map: ${baseMap} using default instead`)

    // load the  default basemap
    const defaultConfig = _find(defaultBaseMapOptions, {
      value: 'default'
    })

    let url = defaultConfig.mapboxUrl.replace(
      'mapbox://styles/',
      'https://api.mapbox.com/styles/v1/'
    )

    url = `${url}${
      defaultConfig.mapboxUrl.endsWith('?optimize=true') ? '&' : '?'
    }access_token=${mapboxAccessToken}`

    try {
      const response = await fetch(url)
      const result = await response.json()
      return {
        baseMapStyle: result
      }
    } catch (err) {
      debug.error(err)
    }
  }
}

const debouncedUpdateMapPosition: any = _debounce(
  async (state: BaseMapState, position: MapPosition, bbox) => {
    if (state.position) {
      const from: Point = {
        type: 'Point',
        coordinates: [state.position.lng, state.position.lat]
      }
      const to: Point = {
        type: 'Point',
        coordinates: [position.lng, position.lat]
      }
      let distance = 0

      try {
        distance = _distance(from, to, {
          units: 'kilometers'
        })
      } catch {
        debug.error('error calculating map move distance')
      }

      // debug.log('map moved: ' + distance + 'km')
      if (distance < 50 && Math.abs(position.zoom - position.zoom) < 1) {
        state.position = position
        return
      }
    }

    const bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    const lat = position.lat
    const lng = position.lng
    const zoom = Math.round(position.zoom)

    if (state.bingImagerySet) {
      const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${state.bingImagerySet}/${lat},${lng}?zl=${zoom}&include=ImageryProviders&key=${state.bingKey}`
      let attributionString = '© Bing Maps'
      try {
        const res = await fetch(url)
        const metadata = await res.json()

        const attributions = []
        const bboxFeature = _bboxPolygon(bounds)
        if (
          metadata.resourceSets &&
          metadata.resourceSets.length > 0 &&
          metadata.resourceSets[0].resources &&
          metadata.resourceSets[0].resources.length > 0 &&
          metadata.resourceSets[0].resources[0].imageryProviders &&
          metadata.resourceSets[0].resources[0].imageryProviders.length > 0
        ) {
          const resource = metadata.resourceSets[0].resources[0]
          let imageryTime = ''

          if (resource.vintageEnd) {
            imageryTime =
              '<b class="no-margin no-padding">(' +
              resource.vintageEnd +
              ')</b>'
          }

          const imageryProviders = resource.imageryProviders
          for (const provider of imageryProviders) {
            for (let i = 0; i < provider.coverageAreas.length; i++) {
              const providerBboxFeature = _bboxPolygon(
                provider.coverageAreas[i].bbox
              )

              if (
                _intersect(bboxFeature, providerBboxFeature) &&
                zoom >= provider.coverageAreas[i].zoomMin &&
                zoom <= provider.coverageAreas[i].zoomMax
              ) {
                attributions.push(provider.attribution)
              }
            }
          }
          attributionString =
            attributionString +
            ': ' +
            imageryTime +
            ' ' +
            attributions.toString()
        }
        state.position = position
        state.attribution = attributionString
      } catch (err) {
        debug.error(err)
      }
    }
  }
)

const setBaseMapThunk = createAsyncThunk(
  'baseMap/setBaseMap',
  async (
    baseMap: string,
    { getState }
  ): Promise<{
    baseMap: string
    baseMapStyle: BaseMapState['baseMapStyle']
    attribution?: string
    updateWithMapPosition?: boolean
    bingImagerySet?: string
  }> => {
    const appState = getState() as AppState
    const state = appState.baseMap
    const { baseMapStyle, attribution, updateWithMapPosition, bingImagerySet } =
      await getBaseMapStyle(state, baseMap)
    return {
      baseMap,
      baseMapStyle,
      attribution,
      updateWithMapPosition,
      bingImagerySet
    }
  }
)

export const baseMapSlice = createSlice({
  name: 'baseMap',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`

    // Inspired by: https://github.com/gmaclennan/leaflet-bing-layer
    updateMapPosition: (
      state,
      action: PayloadAction<{ position: any; bbox: any }>
    ) => {
      const { position, bbox } = action.payload
      // ignore unless using a service that needs this... like Bing
      if (state.updateWithMapPosition) {
        debouncedUpdateMapPosition(state, position, bbox)
      }
    },
    setMapboxAccessToken: (state, action: PayloadAction<string>) => {
      state.mapboxAccessToken = action.payload
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder.addCase(
      setBaseMapThunk.fulfilled,
      (
        state,
        action: PayloadAction<{
          baseMap: string
          baseMapStyle: mapboxgl.Style
          attribution?: string
          updateWithMapPosition?: boolean
          bingImagerySet?: string
        }>
      ) => {
        const {
          baseMap,
          baseMapStyle,
          attribution,
          updateWithMapPosition,
          bingImagerySet
        } = action.payload
        state.baseMap = baseMap
        state.baseMapStyle = baseMapStyle
        if (attribution) state.attribution = attribution
        if (updateWithMapPosition)
          state.updateWithMapPosition = updateWithMapPosition
        if (bingImagerySet) state.bingImagerySet = bingImagerySet
      }
    )
    return
  }
})

export const { updateMapPosition, setMapboxAccessToken } = baseMapSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectBaseMapStyle = (
  state: AppState
): BaseMapState['baseMapStyle'] => state.baseMap.baseMapStyle

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export { setBaseMapThunk }

export default baseMapSlice.reducer
