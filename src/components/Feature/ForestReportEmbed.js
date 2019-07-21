// @flow
import React from 'react'
import XComponentReact from '../XComponentReact'
import 'rc-slider/dist/rc-slider.min.css'
import Slider from 'rc-slider'
import { Subscribe } from 'unstated'
import FRContainer from './containers/FRContainer'
import MapContainer from '../Map/containers/MapContainer'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {|
  onModuleToggle: Function
|}

type State = {
  loaded: boolean
}

export default class ForestReportEmbed extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  componentDidMount () {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({loaded: true})
  }

  render () {
    if (!MAPHUBS_CONFIG.FR_API_KEY) {
      return (
        <p>API Key Required!</p>
      )
    }

    const {onModuleToggle} = this.props

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

    if (this.state.loaded) {
      return (
        <Subscribe to={[FRContainer, MapContainer]}>
          {(FRState, MapState) => {
            const {geoJSON, bufferFeature, isBuffered, FRRemainingThreshold} = FRState.state
            const dimensions = {width: '100%', height: isBuffered ? 'calc(100% - 75px)' : '100%'}
            if (!geoJSON || !geoJSON.features ||
                  geoJSON.features.length === 0
            ) {
              return (
                <p>Invalid Feature</p>
              )
            }
            let feature = geoJSON
            let geom
            if (isBuffered && bufferFeature) {
              feature = bufferFeature
              geom = feature.geometry
            } else {
              geom = feature.features[0].geometry
            }
            return (
              <div style={{width: '100%', height: '100%'}}>
                {isBuffered &&
                  <div style={{height: '75px', padding: '25px'}}>
                    <Slider min={1} max={50} marks={marks} step={null}
                      onChange={FRState.changeBuffer}
                      defaultValue={25} />
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
                    remainingThreshold={FRRemainingThreshold || 80}
                    geom={geom}
                    onLoad={(config: Object) => {
                      FRState.activateFR(config, MapState.state.map)
                    }}
                    onModuleToggle={onModuleToggle}
                    onAlertClick={FRState.onAlertClick}
                  />
                </div>
              </div>
            )
          }}
        </Subscribe>
      )
    } else {
      return ''
    }
  }
}
