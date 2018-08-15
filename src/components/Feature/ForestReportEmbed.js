// @flow
import React from 'react'
import XComponentReact from '../XComponentReact'
import turfBuffer from '../../services/patched-turf-buffer'
import 'rc-slider/dist/rc-slider.min.css'
import Slider from 'rc-slider'

type Props = {|
  geoJSON: Object,
  onLoad: Function,
  onAlertClick: Function,
  onModuleToggle: Function,
  onGeoJSONChange: Function,
  remainingThreshold?: number
|}

type State = {
  loaded: boolean,
  geoJSON?: Object,
  isPoint?: boolean,
  pointGeom?: Object,
  buffer: number
}

export default class ForestReportEmbed extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      loaded: false,
      buffer: 25
    }
  }

  componentDidMount () {
    const {geoJSON, onGeoJSONChange} = this.props
    let isPoint
    let pointGeom
    if (geoJSON) {
      const feature = geoJSON.features[0]
      let geom = feature.geometry
      if (geom.type === 'Point') {
        isPoint = true
        pointGeom = JSON.parse(JSON.stringify(geom))
        const bufferFeature = turfBuffer(geom, 25, {steps: 128})
        if (bufferFeature) {
          geom = bufferFeature.geometry
          feature.geometry = geom
          if (geoJSON.bbox) delete geoJSON.bbox
          onGeoJSONChange(geoJSON)
        }
      }
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({loaded: true, geoJSON, pointGeom, isPoint})
    } else {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({loaded: true})
    }
  }

  changeBuffer = (buffer: number) => {
    const {geoJSON, onGeoJSONChange} = this.props
    const {pointGeom} = this.state
    if (geoJSON && pointGeom) {
      const feature = geoJSON.features[0]
      let geom = pointGeom
      const bufferFeature = turfBuffer(geom, buffer, {steps: 128})
      if (bufferFeature) {
        geom = bufferFeature.geometry
        feature.geometry = geom
        if (geoJSON.bbox) delete geoJSON.bbox
        onGeoJSONChange(geoJSON)
      }
      this.setState({geoJSON, buffer})
      
    }
  }

  render () {
    if (!MAPHUBS_CONFIG.FR_API_KEY) {
      return (
        <p>API Key Required!</p>
      )
    }

    const {onLoad, onModuleToggle, onAlertClick, remainingThreshold} = this.props
    const {geoJSON, isPoint} = this.state

    if (!geoJSON || !geoJSON.features ||
        geoJSON.features.length === 0
    ) {
      return (
        <p>Invalid Feature</p>
      )
    }
    let marks = {
      1: '1km',
      5: '5km',
      10: '10km',
      15: '15km',
      20: '20km',
      25: '25km',
      30: '30km',
      35: '35km',
      40: '40km',
      45: '45km',
      50: '50km'
    }

    let geom = geoJSON.features[0].geometry
    const dimensions = {width: '100%', height: isPoint ? 'calc(100% - 75px)' :'100%'}
    if (this.state.loaded) {
      return (
        <div style={{width: '100%', height: '100%'}}>
          {isPoint &&
            <div style={{height: '75px', padding: '25px'}}>
              <Slider min={1} max={50} marks={marks} step={null} onChange={this.changeBuffer} defaultValue={25} />
            </div>
          }
          <div style={dimensions}>
            <XComponentReact
              tag='forest-report-feature-profile'
              url={`${MAPHUBS_CONFIG.FR_API}/xembed?apiKey=${MAPHUBS_CONFIG.FR_API_KEY}`}
              containerProps={{
                style: {width: '100%', height: '100%'}
              }}
              dimensions={{width: '100%', height: '100%'}}
              remainingThreshold={remainingThreshold || 80}
              geom={geom} onLoad={onLoad}
              onModuleToggle={onModuleToggle} onAlertClick={onAlertClick}
            />
          </div>
        </div>
      )
    } else {
      return ''
    }
  }
}
