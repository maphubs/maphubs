import { Container } from 'unstated'
import _bboxPolygon from '@turf/bbox-polygon'
import _intersect from '@turf/intersect'
import _debounce from 'lodash.debounce'
import _distance from '@turf/distance'
import _find from 'lodash.find'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'BaseMapContainer'
)

const request = require('superagent')

const defaultBaseMapOptions = require('../BaseMaps/base-map-options.json')

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
  baseMapStyle?: Record<string, any>
  attribution: string
  bingImagerySet?: string
  updateWithMapPosition: boolean
  baseMapOptions: Array<BaseMapOption>
  bingKey?: string
  tileHostingKey?: string
  mapboxAccessToken: string
}
export default class BaseMapContainer extends Container<BaseMapState> {
  constructor(initialState?: Record<string, any>) {
    super()
    const state = {
      baseMap: 'default',
      attribution: '© Mapbox © OpenStreetMap',
      updateWithMapPosition: false,
      baseMapOptions: defaultBaseMapOptions,
      mapboxAccessToken: ''
    }

    if (initialState) {
      Object.assign(state, initialState)
    }

    this.state = state
  }

  position: any
  initBaseMap: () => Promise<any> = async () => {
    if (!this.state.baseMapStyle) {
      const baseMapStyle = await this.getBaseMapStyle(this.state.baseMap)
      return this.setState({
        baseMapStyle
      })
    }
  }
  setBaseMap: (baseMap: string) => Promise<void> = async (baseMap: string) => {
    const baseMapStyle = await this.getBaseMapStyle(baseMap)
    await this.setState({
      baseMap,
      baseMapStyle
    })
    return baseMapStyle
  }
  debouncedUpdateMapPosition: any = _debounce((position, bbox) => {
    const _this = this

    if (this.position) {
      const from = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [this.position.lng, this.position.lat]
        }
      }
      const to = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [position.lng, position.lat]
        }
      }
      let distance = 0

      try {
        distance = _distance(from, to, {
          units: 'kilometers'
        })
      } catch (err) {
        debug.error('error calculating map move distance')
      }

      // debug.log('map moved: ' + distance + 'km')
      if (distance < 50 && Math.abs(this.position.zoom - position.zoom) < 1) {
        this.position = position
        return
      }
    }

    const bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    const lat = position.lat
    const lng = position.lng
    const zoom = Math.round(position.zoom)

    if (this.state.bingImagerySet) {
      const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${this.state.bingImagerySet}/${lat},${lng}?zl=${zoom}&include=ImageryProviders&key=${this.state.bingKey}`
      let attributionString = '© Bing Maps'
      request.get(url).end((err, res) => {
        if (err) {
          debug.error(err)
        } else {
          const metadata = res.body
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
            imageryProviders.forEach((provider) => {
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
            })
            attributionString =
              attributionString +
              ': ' +
              imageryTime +
              ' ' +
              attributions.toString()
          }

          _this.position = position

          _this.setState({
            attribution: attributionString
          })
        }
      })
    }
  })
  // Inspired by: https://github.com/gmaclennan/leaflet-bing-layer
  updateMapPosition: (position: any, bbox: any) => void = (
    position: any,
    bbox: any
  ) => {
    // ignore unless using a service that needs this... like Bing
    if (this.state.updateWithMapPosition) {
      this.debouncedUpdateMapPosition(position, bbox, this.state.bingKey)
    }
  }

  /*
  getBingSource = async (type: string) => {
    const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${type}?key=${this.state.bingKey}&include=ImageryProviders`
    try {
      const res = await request.get(url)
      const metadata = res.body
      return metadata
    } catch (err) {
      debug.error(err)
    }
  }
  */

  /*
  loadFromFile (name, cb) {
    if (name === 'positron') {
      cb(this.setTileHostingKey(positron))
    } else if (name === 'darkmatter') {
      cb(this.setTileHostingKey(darkmatter))
    } else if (name === 'osmLiberty') {
      cb(this.setTileHostingKey(osmLiberty))
    } else if (name === 'osmBright') {
      cb(this.setTileHostingKey(osmBright))
    } else {
      debug.log(`unknown base map file: ${name}`)
      cb(positron)
    }
  }
  */
  getBaseMapStyle: (baseMap: string) => Promise<void> = async (
    baseMap: string
  ) => {
    const { mapboxAccessToken, tileHostingKey, baseMapOptions } = this.state

    const config = _find(baseMapOptions, {
      value: baseMap
    })

    if (config) {
      this.setState({
        attribution: config.attribution,
        updateWithMapPosition: config.updateWithMapPosition
      })

      if (baseMap === 'bing-satellite') {
        // const bingMetadata = await this.getBingSource('Aerial')
        this.setState({
          bingImagerySet: 'Aerial'
        })
        const style = config.style

        if (!style.glyphs) {
          style.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
        }

        if (!style.sprite) {
          style.sprite = ''
        }

        return style
      } else if (config.loadFromFile) {
        // this.loadFromFile(config.loadFromFile, cb)
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

        return style
      } else if (config.url) {
        try {
          const res = await request.get(config.url)
          const style = res.body

          if (!style.glyphs) {
            style.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
          }

          if (!style.sprite) {
            style.sprite = ''
          }

          return style
        } catch (err) {
          debug.error(err)
        }
      } else if (config.tilehostingUrl) {
        const url = config.tilehostingUrl + tileHostingKey

        try {
          const res = await request.get(url)
          const style = res.body

          if (!style.glyphs) {
            style.glyphs = `https://maps.tilehosting.com/fonts/{fontstack}/{range}.pbf.pict?key=${tileHostingKey}`
          }

          if (!style.sprite) {
            style.sprite = ''
          }

          return style
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

        if (config.mapboxUrl.endsWith('?optimize=true')) {
          url = url + '&access_token=' + mapboxAccessToken
        } else {
          url = url + '?access_token=' + mapboxAccessToken
        }

        try {
          const res = await request.get(url)
          return res.body
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

      if (defaultConfig.mapboxUrl.endsWith('?optimize=true')) {
        url = url + '&access_token=' + mapboxAccessToken
      } else {
        url = url + '?access_token=' + mapboxAccessToken
      }

      try {
        const res = await request.get(url)
        return res.body
      } catch (err) {
        debug.error(err)
      }
    }
  }
}