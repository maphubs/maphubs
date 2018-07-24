// @flow
import React from 'react'
import XComponentReact from '../XComponentReact'
import turfBuffer from '../../services/patched-turf-buffer'

type Props = {|
  geoJSON: Object,
  onLoad: Function,
  onAlertClick: Function,
  onModuleToggle: Function,
  onGeoJSONChange: Function
|}

type State = {
  loaded: boolean,
  geoJSON: Object
}

export default class ForestReportEmbed extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  componentDidMount () {
    const {geoJSON, onGeoJSONChange} = this.props
    if (geoJSON) {
      const feature = geoJSON.features[0]
      let geom = feature.geometry
      if (geom.type === 'Point') {
        const bufferFeature = turfBuffer(geom, 25, {steps: 128})
        if (bufferFeature) {
          geom = bufferFeature.geometry
          feature.geometry = geom
          if (geoJSON.bbox) delete geoJSON.bbox
          onGeoJSONChange(geoJSON)
        }
      }
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({loaded: true, geoJSON})
  }

  render () {
    if (!MAPHUBS_CONFIG.FR_API_KEY) {
      return (
        <p>API Key Required!</p>
      )
    }

    const {onLoad, onModuleToggle, onAlertClick} = this.props
    const {geoJSON} = this.state

    if (!geoJSON || !geoJSON.features ||
        geoJSON.features.length === 0
    ) {
      return (
        <p>Invalid Feature</p>
      )
    }

    let geom = geoJSON.features[0].geometry
    const dimensions = {width: '100%', height: '100%'}
    if (this.state.loaded) {
      return (
        <XComponentReact
          tag='forest-report-feature-profile'
          url={`${MAPHUBS_CONFIG.FR_API}/xembed?apiKey=${MAPHUBS_CONFIG.FR_API_KEY}`}
          containerProps={{
            style: dimensions
          }}
          dimensions={dimensions}
          geom={geom} onLoad={onLoad}
          onModuleToggle={onModuleToggle} onAlertClick={onAlertClick}
        />
      )
    } else {
      return ''
    }
  }
}
