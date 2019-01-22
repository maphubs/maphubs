// @flow
import _debounce from 'lodash.debounce'
import MapStyles from '../Styles'
import type {GLStyle} from '../../../types/mapbox-gl-style'
import $ from 'jquery'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('MapInteractionMixin')

/**
 * Helper functions for interacting with the map and selecting features
 */
export default {
  setSelectionFilter (features: Array<Object>) {
    if (this.glStyle) {
      this.glStyle.layers.forEach((layer) => {
        const filter = ['in', 'mhid']
        features.forEach((feature) => {
          filter.push(feature.properties.mhid)
        })
        if (this.map.getLayer(layer.id) &&
          filter[2] // found a mhid
        ) {
          if (layer.id.startsWith('omh-hover-point')) {
            this.map.setFilter(layer.id, ['all', ['in', '$type', 'Point'], filter])
          } else if (layer.id.startsWith('omh-hover-line')) {
            this.map.setFilter(layer.id, ['all', ['in', '$type', 'LineString'], filter])
          } else if (layer.id.startsWith('omh-hover-polygon')) {
            this.map.setFilter(layer.id, ['all', ['in', '$type', 'Polygon'], filter])
          }
        }
      })
    }
  },

  clearSelectionFilter () {
    if (this.map && this.glStyle) {
      this.glStyle.layers.forEach((layer) => {
        if (layer.id.startsWith('omh-hover')) {
          if (this.map.getLayer(layer.id)) {
            this.map.setFilter(layer.id, ['==', 'mhid', ''])
          }
        }
      })
    }
  },

  clearSelection () {
    this.clearSelectionFilter()
    this.setState({selected: false, selectedFeature: undefined})
  },

  getInteractiveLayers (glStyle: GLStyle) {
    const interactiveLayers = []
    if (glStyle) {
      glStyle.layers.forEach((layer) => {
        if (layer.metadata && layer.metadata['maphubs:interactive'] &&
          (layer.id.startsWith('omh') ||
          layer.id.startsWith('osm'))
        ) {
          interactiveLayers.push(layer.id)
        }
      })
    }
    return interactiveLayers
  },

  clickHandler (e: any) {
    const map = this.map

    if (this.state.enableMeasurementTools) {

    } else {
      // feature selection
      if (!this.state.selected && this.state.selectedFeature) {
        this.setState({selected: true})
      } else {
        $(this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair')

        const features = map.queryRenderedFeatures(
          [
            [e.point.x - this.props.interactionBufferSize / 2, e.point.y - this.props.interactionBufferSize / 2],
            [e.point.x + this.props.interactionBufferSize / 2, e.point.y + this.props.interactionBufferSize / 2]
          ], {layers: this.state.interactiveLayers})

        if (features && features.length > 0) {
          if (this.state.selected) {
            this.clearSelection()
          }

          const feature = features[0]
          // find presets and add to props
          if (feature.layer && feature.layer.source) {
            let presets = MapStyles.settings.getSourceSetting(this.glStyle, feature.layer.source, 'presets')
            if (!presets) {
              debug.log(`presets not found in source ${feature.layer.source}`)
              const source = this.glStyle.sources[feature.layer.source]
              let data
              if (source) {
                data = source.data
              }
              if (data) {
                if (data.metadata) {
                  presets = data.metadata['maphubs:presets']
                  if (presets) {
                    debug.log(`presets FOUND! for source ${feature.layer.source}`)
                  } else {
                    debug.log(`presets not found in data.metadata for source ${feature.layer.source}`)
                  }
                } else {
                  debug.log(`data.metadata not found in source ${feature.layer.source}`)
                }
              } else {
                debug.log(`data not found in source ${feature.layer.source}`)
              }
            }
            if (!feature.properties['maphubs_metadata']) {
              feature.properties['maphubs_metadata'] = {}
            }
            feature.properties['maphubs_metadata'].presets = presets
          }

          if (this.state.editing) {
            if (feature.properties.layer_id &&
              this.state.editingLayer.layer_id === feature.properties.layer_id) {
              this.editFeature(feature)
            }
            return // return here to disable interactation with other layers when editing
          }

          this.setSelectionFilter([feature])
          this.setState({selectedFeature: feature, selected: true})
        } else if (this.state.selectedFeature) {
          this.clearSelection()
          $(this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
        }
      }
    }
  },

  // fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
  mousemoveHandler (e: any) {
    const map = this.map
    const _this = this

    if (_this.state.enableMeasurementTools) {

    } else {
      const debounced = _debounce(() => {
        if (_this.state.mapLoaded && _this.state.restoreBounds) {
          debug.log('(' + _this.state.id + ') ' + 'clearing restoreBounds')
          _this.setState({restoreBounds: null})
          // stop restoring map possition after user has moved the map
        }

        const features = map.queryRenderedFeatures(
          [
            [e.point.x - _this.props.interactionBufferSize / 2, e.point.y - _this.props.interactionBufferSize / 2],
            [e.point.x + _this.props.interactionBufferSize / 2, e.point.y + _this.props.interactionBufferSize / 2]
          ],
          {layers: _this.state.interactiveLayers})

        if (features && features.length > 0) {
          if (_this.state.selected) {
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair')
          } else if (_this.props.hoverInteraction) {
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'crosshair')
            // _this.setSelectionFilter(features);
            // _this.setState({selectedFeatures:features});
          } else {
            $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', 'pointer')
          }
        } else if (!_this.state.selected && _this.state.selectedFeatures !== null) {
          _this.clearSelection()
          $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
        } else {
          $(_this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
        }
      }, 300).bind(this)
      debounced()
    }
  }
}
