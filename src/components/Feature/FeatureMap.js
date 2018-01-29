//  @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import Map from '../Map/Map'
import turf_bbox from '@turf/bbox'

type Props = {
  geojson: Object,
  mapConfig: Object,
  gpxLink: Object
}

type State = {
  glStyle: Object
}

export default class FeatureLocation extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      glStyle: this.getDataStyle(props.geojson)
    }
  }

  activateFR = (data: Object) => {
    // console.log(data);
    let combinedGLADFeatures = []
    data.values.forEach((value) => {
      combinedGLADFeatures = combinedGLADFeatures.concat(value.features)
    })
    const gladGeoJSON = {
      type: 'FeatureCollection',
      features: combinedGLADFeatures
    }
    const glStyle = this.getFRStyle(gladGeoJSON)
    this.setState({glStyle})
  }

  deactiveFR = () => {
    this.setState({glStyle: this.getDataStyle(this.props.geojson)})
  }

  onAlertClick = (alert: Object) => {
    // console.log(alert);
    const map = this.refs.map.map
    const geoJSONData = map.getSource('fr-glad-geojson')
    const data = {
      type: 'FeatureCollection',
      features: alert.features
    }
    geoJSONData.setData(data)

    const bbox = turf_bbox(data)
    const bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
    map.fitBounds(bounds, {padding: 25, curve: 3, speed: 0.6, maxZoom: 18})
  }

  getFRStyle = (gladGeoJSON: Object) => {
    const defaultColor = 'yellow'
    const gladColor = 'red'
    const layers = [
      {
        'id': 'fr-tree-cover-density',
        'type': 'raster',
        'source': 'fr-tree-cover-density',
        'minzoom': 0,
        'maxzoom': 18,
        'paint': {
          'raster-opacity': 1
        }
      },
      {
        'id': `omh-data-polygon-glad-geojson`,
        'type': 'fill',
        'metadata': {
          'maphubs:interactive': false,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'fr-glad-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'fill-color': gladColor,
          'fill-opacity': 0.2
        }
      }, {
        'id': `fr-data-outline-polygon-glad-geojson`,
        'type': 'line',
        'metadata': {
        },
        'source': 'fr-glad-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'line-color': gladColor,
          'line-opacity': 1,
          'line-width': 1
        }
      },
      {
        'id': `omh-data-point-feature-geojson`,
        'type': 'circle',
        'metadata': {
          'maphubs:interactive': true,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Point'],
        'paint': {
          'circle-color': defaultColor,
          'circle-opacity': 1
        }
      }, {
        'id': `omh-data-line-feature-geojson`,
        'type': 'line',
        'metadata': {
          'maphubs:interactive': true,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'LineString'],
        'paint': {
          'line-color': defaultColor,
          'line-opacity': 0.5,
          'line-width': 2
        }
      },
      {
        'id': `omh-data-polygon-feature-geojson`,
        'type': 'fill',
        'metadata': {
          'maphubs:interactive': false,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'fill-color': 'white',
          'fill-opacity': 0
        }
      }, {
        'id': `omh-data-outline-polygon-feature-geojson`,
        'type': 'line',
        'metadata': {
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'line-color': defaultColor,
          'line-opacity': 0.8,
          'line-width': 3
        }
      }
    ]

    const style = {
      version: 8,
      sources: {
        'omh-feature-geojson': {
          type: 'geojson',
          data: this.props.geojson
        },
        'fr-glad-geojson': {
          type: 'geojson',
          data: gladGeoJSON
        },
        'fr-tree-cover-density': {
          type: 'raster',
          tiles: [
            'https://tile-api.forest.report/remaining/80/{z}/{x}/{y}'
          ],
          tileSize: 256
        }

      },
      layers
    }
    return style
  }

  getDataStyle = (geojson: Object) => {
    const defaultColor = 'red'
    const layers = [
      {
        'id': `omh-data-point-feature-geojson`,
        'type': 'circle',
        'metadata': {
          'maphubs:interactive': true,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Point'],
        'paint': {
          'circle-color': defaultColor,
          'circle-opacity': 1
        }
      }, {
        'id': `omh-data-line-feature-geojson`,
        'type': 'line',
        'metadata': {
          'maphubs:interactive': true,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'LineString'],
        'paint': {
          'line-color': defaultColor,
          'line-opacity': 0.5,
          'line-width': 2
        }
      },
      {
        'id': `omh-data-polygon-feature-geojson`,
        'type': 'fill',
        'metadata': {
          'maphubs:interactive': false,
          'maphubs:showBehindBaseMapLabels': false
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'fill-color': defaultColor,
          'fill-opacity': 0.3
        }
      }, {
        'id': `omh-data-outline-polygon-feature-geojson`,
        'type': 'line',
        'metadata': {
        },
        'source': 'omh-feature-geojson',
        'filter': ['in', '$type', 'Polygon'],
        'paint': {
          'line-color': defaultColor,
          'line-opacity': 0.8,
          'line-width': 3
        }
      }
    ]

    const style = {
      version: 8,
      sources: {
        'omh-feature-geojson': {
          type: 'geojson',
          data: geojson
        }
      },
      layers
    }
    return style
  }

  render () {
    const {geojson, mapConfig, gpxLink} = this.props
    return (
      <Map ref='map'
        id='feature-map'
        style={{
          height: 'calc(100vh - 50px)'
        }}
        fitBounds={geojson.bbox}
        glStyle={this.state.glStyle}
        mapConfig={mapConfig}
        gpxLink={gpxLink}
      />
    )
  }
}
