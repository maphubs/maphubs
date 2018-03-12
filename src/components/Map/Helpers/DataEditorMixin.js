// @flow
import DataEditorActions from '../../../actions/DataEditorActions'
import type {Layer} from '../../../stores/layer-store'
import theme from '@mapbox/mapbox-gl-draw/src/lib/theme'

const debug = require('../../../services/debug')('Map/DataEditorMixin')
const $ = require('jquery')

let MapboxDraw = {}
if (typeof window !== 'undefined') {
  MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js')
}

module.exports = {

  getFirstDrawLayerID () {
    return this.getEditorStyles()[0].id + '.cold'
  },

  getEditorStyles () {
    return theme
  },

  editFeature (feature: Object) {
    // get the feature from the database, since features from vector tiles can be incomplete or simplified
    DataEditorActions.selectFeature(feature.properties.mhid, feature => {
      if (this.draw) {
        if (!this.draw.get(feature.id)) {
        // if not already editing this feature
          this.draw.add(feature)
          this.updateMapLayerFilters()
        }
      }
    })
  },

  startEditingTool (layer: Layer) {
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: layer.data_type === 'point',
        polygon: layer.data_type === 'polygon',
        line_string: layer.data_type === 'line',
        trash: true
      },
      styles: this.getEditorStyles()
    })
    this.draw = draw

    this.map.addControl(draw, 'top-right')

    this.map.on('draw.create', e => {
      debug.log('draw create')
      const features = e.features
      if (features && features.length > 0) {
        features.forEach(feature => {
          DataEditorActions.createFeature(feature)
        })
      }
    })

    this.map.on('draw.update', e => {
      debug.log('draw update')
      this.updateEdits(e)
    })

    this.map.on('draw.delete', e => {
      debug.log('draw delete')
      const features = e.features
      if (features && features.length > 0) {
        features.forEach(feature => {
          DataEditorActions.deleteFeature(feature)
        })
      }
    })

    this.map.on('draw.selectionchange', e => {
      debug.log('draw selection')
      // if in simple mode (e.g. not selecting vertices) then check if selected feature changed
      const mode = this.draw.getMode()
      if (mode === 'simple_select') {
        const features = e.features
        if (features && features.length > 0) {
          features.forEach(feature => {
            DataEditorActions.selectFeature(feature.id, () => {})
          })
        }
      }
    })
  },

  stopEditingTool () {
    this.map.removeControl(this.draw)
    this.removeMapLayerFilters()
    this.reloadEditingSourceCache()
    this.reloadStyle()
  },

  updateEdits (e: any) {
    if (e.features.length > 0) {
      DataEditorActions.updateFeatures(e.features)
    }
  },

  /**
   * Triggered when the store updates a feature
   *
   * @param {string} type
   * @param {any} feature

   *
   */
  onFeatureUpdate (type: string, feature: Object) {
    if (this.draw) {
      if (type === 'update' || type === 'create') {
        this.draw.add(feature.geojson)
      } else if (type === 'delete') {
        this.draw.delete(feature.geojson.id)
      }
    }
  },

  /**
   * Add filter to hide vector tile versions of features active in the drawing tool
   *
   */
  updateMapLayerFilters () {
    const layerId = this.state.editingLayer.layer_id
    const shortid = this.state.editingLayer.shortid

    // build a new filter
    const uniqueIds = []

    this.state.edits.forEach(edit => {
      const mhid = edit.geojson.id
      if (mhid && !uniqueIds.includes(mhid)) {
        uniqueIds.push(mhid)
      }
    })

    this.state.originals.forEach(orig => {
      const mhid = orig.geojson.id
      if (mhid && !uniqueIds.includes(mhid)) {
        uniqueIds.push(mhid)
      }
    })

    const hideEditingFilter = ['!in', 'mhid'].concat(uniqueIds)

    if (this.overlayMapStyle) {
      this.overlayMapStyle.layers.forEach(layer => {
        // check if the layer_id matches
        let foundMatch
        if (layer.metadata && layer.metadata['maphubs:layer_id']) {
          if (layer.metadata['maphubs:layer_id'] === layerId) {
            foundMatch = true
          }
        } else if (layer.id.endsWith(shortid)) {
          foundMatch = true
        }
        if (foundMatch) {
          // get current filter
          let filter = layer.filter
          if (!filter || !Array.isArray(filter) || filter.length === 0) {
            // create a new filter
            filter = hideEditingFilter
          } else if (filter[0] === 'all') {
            // add our condition to the end
            filter = layer.filter.concat(hideEditingFilter)
          } else {
            filter = ['all', filter, hideEditingFilter]
          }
          this.map.setFilter(layer.id, filter)
        }
      })
    }
  },

  removeMapLayerFilters () {
    if (!this.state.editingLayer || !this.state.editingLayer.layer_id) {
      debug.error('unable to find editing layer')
      return
    }

    const layerId = this.state.editingLayer.layer_id

    if (this.glStyle) {
      this.glStyle.layers.forEach(layer => {
        // check if the layer_id matches
        let foundMatch
        if (layer.metadata && layer.metadata['maphubs:layer_id']) {
          if (layer.metadata['maphubs:layer_id'] === layerId) {
            foundMatch = true
          }
        } else if (layer.id.endsWith(layerId)) {
          foundMatch = true
        }
        if (foundMatch) {
          // get current filter
          let filter = layer.filter
          if (!filter || !Array.isArray(filter) || filter.length === 0) {
            // do nothing
          } else if (filter[0] === 'all') {
            // remove our filter from the end
            filter = layer.filter.pop()
          } else {
            filter = undefined
          }
          this.map.setFilter(layer.id, filter)
        }
      })
    }
  },

  reloadEditingSourceCache () {
    const sourceID = Object.keys(this.state.editingLayer.style.sources)[0]
    const sourceCache = this.map.style.sourceCaches[sourceID]
    if (sourceCache) {
      sourceCache.reload()
    }
  }

}
