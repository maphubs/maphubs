//  @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import InteractiveMap from '../InteractiveMap'
import turf_bbox from '@turf/bbox'
import {getLayer, getLayerFRActive} from './Map/layer-feature'
import {getRemainingLayer} from './Map/layer-remaining'
import {getGLADLayer} from './Map/layer-glad'
import {getIFLLayer} from './Map/layer-ifl'
import {getIFLLossLayer} from './Map/layer-ifl-loss'
import {getLossLayer} from './Map/layer-loss'
import StyleHelper from '../Map/Styles/style'

import type {Layer} from '../../stores/layer-store'

type Props = {
  layer: Layer,
  geojson: Object,
  mapConfig: Object,
  gpxLink: Object
}

type State = {
  featureLayer: Layer,
  mapLayers: Array<Layer>,
  glStyle: Object
}

export default class FeatureMap extends MapHubsComponent<Props, State> {
  map: any
  constructor (props: Props) {
    super(props)
    const layer = getLayer(props.layer, props.geojson)

    let glStyle = {}
    if (layer.style) {
      glStyle = JSON.parse(JSON.stringify(layer.style))
    }

    this.state = {
      featureLayer: layer,
      glStyle,
      mapLayers: [layer]
    }
  }

  activateFR = (config: Object) => {
    // console.log(data);
    let combinedGLADFeatures = []
    config.glad.data.values.forEach((value) => {
      combinedGLADFeatures = combinedGLADFeatures.concat(value.features)
    })
    const gladGeoJSON = {
      type: 'FeatureCollection',
      features: combinedGLADFeatures
    }

    let ifl2016Data
    if (config.ifl2016 && config.ifl2016.features) {
      ifl2016Data = {type: 'FeatureCollection', features: config.ifl2016.features}
    }

    let iflLoss0013Data
    let iflLoss1316Data
    if (config.loss0013 && config.loss0013.features) {
      iflLoss0013Data = {type: 'FeatureCollection', features: config.loss0013.features}
    }
    if (config.loss1316 && config.loss1316.features) {
      iflLoss1316Data = {type: 'FeatureCollection', features: config.loss1316.features}
    }

    const mapLayers = [
      getGLADLayer(gladGeoJSON, config.toggles.glad),
      getIFLLossLayer(iflLoss0013Data, iflLoss1316Data, config.toggles.ifl),
      getIFLLayer(ifl2016Data, config.toggles.iflloss),
      getLayerFRActive(this.state.featureLayer, this.props.geojson),
      getLossLayer(config.toggles.loss),
      getRemainingLayer(config.toggles.remaining)
    ]

    const glStyle = StyleHelper.buildMapStyle(mapLayers)

    this.setState({mapLayers, glStyle})
  }

  deactiveFR = () => {
    this.setState({mapLayers: [this.state.featureLayer]})
  }

  frToggle = (id: string) => {
    if (id === 'remaining') {
      this.map.toggleVisibility(99999901)
    } else if (id === 'loss') {
      this.map.toggleVisibility(99999905)
    } else if (id === 'glad') {
      this.map.toggleVisibility(99999902)
    } else if (id === 'ifl') {
      this.map.toggleVisibility(99999903)
    } else if (id === 'iflloss') {
      this.map.toggleVisibility(99999904)
    }
  }

  onAlertClick = (alert: Object) => {
    // console.log(alert);
    const map = this.map.getMap().map
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

  render () {
    const {geojson, mapConfig, gpxLink} = this.props
    const {featureLayer, mapLayers, glStyle} = this.state
    const bbox = geojson ? geojson.bbox : undefined
    return (
      <InteractiveMap
        ref={(el) => { this.map = el }}
        height='100%'
        fitBounds={bbox}
        layers={mapLayers}
        style={glStyle}
        map_id={featureLayer.layer_id}
        mapConfig={mapConfig}
        disableScrollZoom={false}
        title={featureLayer.name}
        hideInactive
        showTitle={false}
        showLegendLayersButton={false}
        gpxLink={gpxLink}
      />
    )
  }
}
