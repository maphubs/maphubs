
// @flow
import shortid from 'shortid'
import request from 'superagent'
import type {GeoJSONObject} from 'geojson-flow'
const debug = require('../../../services/debug')('isochrone-mixin')

module.exports = {

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
          id: `${sourceId}-line-120`,
          type: 'line',
          source: sourceId,
          'filter': ['==', 'contour', 120],
          paint: {
            'line-color': 'red',
            'line-opacity': 0.8,
            'line-width': 4
          }
        },
        {
          id: `${sourceId}-line-60`,
          type: 'line',
          source: sourceId,
          'filter': ['==', 'contour', 60],
          paint: {
            'line-color': 'yellow',
            'line-opacity': 0.8,
            'line-width': 4
          }
        },
        {
          id: `${sourceId}-line-30`,
          type: 'line',
          source: sourceId,
          'filter': ['==', 'contour', 30],
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
      map.off('click', onClick)
    }

    var onClick = function (e) {
      e.originalEvent.stopPropagation()
      _this.runIsochroneQuery(e.lngLat)
      disableClick()
    }

    map.on('click', onClick)
  },

  runIsochroneQuery (point: {lng: number, lat: number}) {
    const _this = this
    const map = this.map

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
      })
  },

  clearIsochroneLayers () {
    const map = this.map
    this.isochroneLayerStyle.layers.forEach((layer) => {
      map.removeLayer(layer.id)
    })
    map.removeSource(this.isochroneLayerStyle.id)
    this.setState({isochroneResult: null})
    this.props.onToggleIsochroneLayer(false)
  },

  /**
   * Initiate saving the active overlay as an actual MapHubs layer
   */
  saveIsochroneLayer () {

  }

}
