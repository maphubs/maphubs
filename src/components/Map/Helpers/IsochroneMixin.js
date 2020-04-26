
// @flow
import shortid from 'shortid'
import request from 'superagent'
import {notification, message} from 'antd'
import type {GeoJSONObject} from 'geojson-flow'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('isochrone-mixin')

export default {

  /**
   * Get the mapbox-gl style for the isochrone data
   */
  getIsochroneStyle (data: GeoJSONObject) {
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

  getIsochronePoint () {
    const map = this.map
    const _this = this

    const disableClick = function () {
      map.off('click', _this.onIsochroneClick)
    }

    this.onIsochroneClick = function (e) {
      e.originalEvent.stopPropagation()
      _this.runIsochroneQuery(e.lngLat)
      disableClick()
    }

    map.on('click', this.onIsochroneClick)
  },

  runIsochroneQuery (point: {lng: number, lat: number}) {
    const _this = this
    const map = this.map
    const {t} = this.props
    message.loading(t('Running travel time query...'), 5)
    request.post('/api/isochrone')
      .send({
        point
      })
      .timeout(60000)
      .type('json').accept('json')
      .then((res) => {
      // get resulting geojson
        const geojson = res.body
        // get a layer with the data embedded
        const layerStyle = this.getIsochroneStyle(geojson)
        this.isochroneLayerStyle = layerStyle

        // add it to the map
        map.addSource(layerStyle.id, layerStyle.source)
        layerStyle.layers.forEach((layer) => {
          map.addLayer(layer)
        })
        _this.setState({isochroneResult: geojson})
        _this.props.onToggleIsochroneLayer(true)
      }).catch((err) => {
        debug.error(err)
        notification.error({
          message: 'Error',
          description: t('Travel time service failed at this location')
        })
      })
  },

  clearIsochroneLayers () {
    const map = this.map

    map.off('click', this.onIsochroneClick)

    this.isochroneLayerStyle.layers.forEach((layer) => {
      map.removeLayer(layer.id)
    })
    map.removeSource(this.isochroneLayerStyle.id)
    this.setState({isochroneResult: undefined})
    this.props.onToggleIsochroneLayer(false)
  },

  /**
   * Initiate saving the active overlay as an actual MapHubs layer
   */
  saveIsochroneLayer () {

  }

}
