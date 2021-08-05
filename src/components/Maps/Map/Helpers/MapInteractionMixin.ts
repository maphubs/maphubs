import _debounce from 'lodash.debounce'
import MapStyles from '../Styles'
import $ from 'jquery'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Feature } from 'geojson'
import mapboxgl from 'mapbox-gl'
const debug = DebugService('MapInteractionMixin')
/**
 * Helper functions for interacting with the map and selecting features
 */

export default {
  setSelectionFilter(features: Feature[]): void {
    if (this.glStyle?.layers) {
      for (const layer of this.glStyle.layers) {
        const filter = ['in', 'mhid']
        for (const feature of features) {
          filter.push(feature.properties.mhid)
        }

        if (
          this.map.getLayer(layer.id) &&
          filter[2] // found a mhid
        ) {
          if (layer.id.startsWith('omh-hover-point')) {
            this.map.setFilter(layer.id, [
              'all',
              ['in', '$type', 'Point'],
              filter
            ])
          } else if (layer.id.startsWith('omh-hover-line')) {
            this.map.setFilter(layer.id, [
              'all',
              ['in', '$type', 'LineString'],
              filter
            ])
          } else if (layer.id.startsWith('omh-hover-polygon')) {
            this.map.setFilter(layer.id, [
              'all',
              ['in', '$type', 'Polygon'],
              filter
            ])
          }
        }
      }
    }
  },

  clearSelectionFilter(): void {
    const { map, glStyle } = this
    if (map && glStyle) {
      for (const layer of glStyle.layers) {
        if (layer.id.startsWith('omh-hover') && map.getLayer(layer.id)) {
          map.setFilter(layer.id, ['==', 'mhid', ''])
        }
      }
    }
  },

  clearSelection(): void {
    this.clearSelectionFilter()
    this.setState({
      selected: false,
      selectedFeature: undefined
    })
  },

  getInteractiveLayers(
    glStyle: mapboxgl.Style
  ): mapboxgl.Layer & { metadata: any } {
    const interactiveLayers = []

    if (glStyle?.layers) {
      for (const layer of glStyle.layers) {
        if (
          layer.metadata &&
          layer.metadata['maphubs:interactive'] &&
          (layer.id.startsWith('omh') || layer.id.startsWith('osm'))
        ) {
          interactiveLayers.push(layer.id)
        }
      }
    }

    return interactiveLayers
  },

  clickHandler(e: mapboxgl.MapMouseEvent): void {
    const map = this.map
    const containers: Record<string, any> = this.props.containers
    const { dataEditorState } = containers

    if (!this.state.enableMeasurementTools) {
      // feature selection
      if (!this.state.selected && this.state.selectedFeature) {
        this.setState({
          selected: true
        })
      } else {
        $(this.refs.map)
          .find('.mapboxgl-canvas-container')
          .css('cursor', 'crosshair')
        const features = map.queryRenderedFeatures(
          [
            [
              e.point.x - this.props.interactionBufferSize / 2,
              e.point.y - this.props.interactionBufferSize / 2
            ],
            [
              e.point.x + this.props.interactionBufferSize / 2,
              e.point.y + this.props.interactionBufferSize / 2
            ]
          ],
          {
            layers: this.state.interactiveLayers
          }
        )

        if (features && features.length > 0) {
          if (this.state.selected) {
            this.clearSelection()
          }

          const feature = features[0]

          // find presets and add to props
          if (feature.layer && feature.layer.source) {
            let presets = MapStyles.settings.getSourceSetting(
              this.glStyle,
              feature.layer.source,
              'presets'
            )

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
                    debug.log(
                      `presets FOUND! for source ${feature.layer.source}`
                    )
                  } else {
                    debug.log(
                      `presets not found in data.metadata for source ${feature.layer.source}`
                    )
                  }
                } else {
                  debug.log(
                    `data.metadata not found in source ${feature.layer.source}`
                  )
                }
              } else {
                debug.log(`data not found in source ${feature.layer.source}`)
              }
            }

            if (!feature.properties.maphubs_metadata) {
              feature.properties.maphubs_metadata = {}
            }

            if (typeof feature.properties.maphubs_metadata === 'string') {
              feature.properties.maphubs_metadata = JSON.parse(
                feature.properties.maphubs_metadata
              )
            }

            if (!feature.properties.maphubs_metadata.presets) {
              feature.properties.maphubs_metadata.presets = presets
            }
          }

          if (dataEditorState.state.editing) {
            if (
              feature.properties.layer_id &&
              dataEditorState.state.editingLayer.layer_id ===
                feature.properties.layer_id
            ) {
              this.editFeature(feature)
            }

            return // return here to disable interactation with other layers when editing
          }

          this.setSelectionFilter([feature])
          this.setState({
            selectedFeature: feature,
            selected: true
          })
        } else if (this.state.selectedFeature) {
          this.clearSelection()
          $(this.refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
        }
      }
    }
  },

  // fires whenever mouse is moving across the map... use for cursor interaction... hover etc.
  mousemoveHandler(e: mapboxgl.MapMouseEvent): void {
    const { props, state, setState, map, refs, clearSelection } = this
    const {
      enableMeasurementTools,
      mapLoaded,
      id,
      restoreBounds,
      interactiveLayers,
      selected,
      selectedFeatures
    } = state
    const { interactionBufferSize, hoverInteraction } = props

    if (!map) return

    if (!enableMeasurementTools) {
      const debounced = _debounce(() => {
        if (mapLoaded && restoreBounds) {
          debug.log('(' + id + ') ' + 'clearing restoreBounds')

          setState({
            restoreBounds: undefined
          }) // stop restoring map possition after user has moved the map
        }

        try {
          const features = map.queryRenderedFeatures(
            [
              [
                e.point.x - interactionBufferSize / 2,
                e.point.y - interactionBufferSize / 2
              ],
              [
                e.point.x + interactionBufferSize / 2,
                e.point.y + interactionBufferSize / 2
              ]
            ],
            {
              layers: interactiveLayers
            }
          )

          if (features && features.length > 0) {
            if (selected) {
              $(refs.map)
                .find('.mapboxgl-canvas-container')
                .css('cursor', 'crosshair')
            } else if (hoverInteraction) {
              $(refs.map)
                .find('.mapboxgl-canvas-container')
                .css('cursor', 'crosshair') // _this.setSelectionFilter(features);
              // _this.setState({selectedFeatures:features});
            } else {
              $(refs.map)
                .find('.mapboxgl-canvas-container')
                .css('cursor', 'pointer')
            }
          } else if (!selected && selectedFeatures) {
            clearSelection()

            $(refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
          } else {
            $(refs.map).find('.mapboxgl-canvas-container').css('cursor', '')
          }
        } catch (err) {
          console.log(err)
        }
      }, 300)

      debounced()
    }
  }
}
