import shortid from 'shortid'
import request from 'superagent'
import { notification, message } from 'antd'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { FeatureCollection } from 'geojson'
const debug = DebugService('isochrone-mixin')
export default {
  /**
   * Get the mapbox-gl style for the isochrone data
   */
  getIsochroneStyle(data: FeatureCollection): {
    id: string
    layers: Array<{
      filter: Array<number | string>
      id: string
      paint: {
        'line-color': string
        'line-opacity': number
        'line-width': number
      }
      source: string
      type: string
    }>
    source: {
      data: FeatureCollection
      type: string
    }
  } {
    const sourceId = `omh-isochrone-${shortid()}`
    return {
      id: sourceId,
      source: {
        type: 'geojson',
        data
      },
      layers: [
        {
          id: `${sourceId}-line-60`,
          type: 'line',
          source: sourceId,
          filter: ['==', 'value', 3600],
          paint: {
            'line-color': 'red',
            'line-opacity': 0.8,
            'line-width': 4
          }
        },
        {
          id: `${sourceId}-line-30`,
          type: 'line',
          source: sourceId,
          filter: ['==', 'value', 1800],
          paint: {
            'line-color': 'yellow',
            'line-opacity': 0.8,
            'line-width': 4
          }
        },
        {
          id: `${sourceId}-line-15`,
          type: 'line',
          source: sourceId,
          filter: ['==', 'value', 900],
          paint: {
            'line-color': 'green',
            'line-opacity': 0.8,
            'line-width': 4
          }
        }
      ]
    }
  },

  getIsochronePoint(): void {
    const map = this.map

    const { onIsochroneClick, runIsochroneQuery } = this

    const disableClick = function () {
      map.off('click', onIsochroneClick)
    }

    this.onIsochroneClick = function (e) {
      e.originalEvent.stopPropagation()

      runIsochroneQuery(e.lngLat)

      disableClick()
    }

    map.on('click', onIsochroneClick)
  },

  runIsochroneQuery(point: { lng: number; lat: number }) {
    const { props, map, setState } = this

    const { t, onToggleIsochroneLayer } = props
    message.loading(t('Running travel time query...'), 5)
    request
      .post('/api/isochrone')
      .send({
        point
      })
      .timeout(60000)
      .type('json')
      .accept('json')
      .then((res) => {
        // get resulting geojson
        const geojson = res.body
        // get a layer with the data embedded
        const layerStyle = this.getIsochroneStyle(geojson)
        this.isochroneLayerStyle = layerStyle
        // add it to the map
        map.addSource(layerStyle.id, layerStyle.source)
        for (const layer of layerStyle.layers) {
          map.addLayer(layer)
        }

        setState({
          isochroneResult: geojson
        })

        onToggleIsochroneLayer(true)
      })
      .catch((err) => {
        debug.error(err)
        notification.error({
          message: 'Error',
          description: t('Travel time service failed at this location')
        })
      })
  },

  clearIsochroneLayers(): void {
    const map = this.map
    map.off('click', this.onIsochroneClick)
    for (const layer of this.isochroneLayerStyle.layers) {
      map.removeLayer(layer.id)
    }
    map.removeSource(this.isochroneLayerStyle.id)
    this.setState({
      isochroneResult: undefined
    })
    this.props.onToggleIsochroneLayer(false)
  }

  /**
   * //TODO: Initiate saving the active overlay as an actual MapHubs layer
   */
  // saveIsochroneLayer() {}
}
