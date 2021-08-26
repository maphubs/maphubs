import React, { useState, useEffect } from 'react'
import XComponentReact from '../XComponentReact'
import 'rc-slider/dist/rc-slider.min.css'
import Slider from 'rc-slider'
import { Subscribe } from 'unstated'
import FRContainer from './containers/FRContainer'

type Props = {
  onModuleToggle: (...args: Array<any>) => void
}

const ForestReportEmbed = ({ onModuleToggle }: Props): JSX.Element => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!loaded) setLoaded(true)
  }, [loaded])

  if (!process.env.NEXT_PUBLIC_FR_API_KEY) {
    return <p>API Key Required!</p>
  }

  const marks = {
    [1]: '1km',
    [5]: '5km',
    [10]: '10km',
    [15]: '15km',
    [20]: '20km',
    [25]: '25km',
    [30]: '30km',
    [35]: '35km',
    [40]: '40km',
    [45]: '45km',
    [50]: '50km'
  }

  return loaded ? (
    <Subscribe to={[FRContainer]}>
      {(FRState) => {
        const { geoJSON, bufferFeature, isBuffered, FRRemainingThreshold } =
          FRState.state
        const dimensions = {
          width: '100%',
          height: isBuffered ? 'calc(100% - 75px)' : '100%'
        }

        if (!geoJSON || !geoJSON.features || geoJSON.features.length === 0) {
          return <p>Invalid Feature</p>
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
          <div
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            {isBuffered && (
              <div
                style={{
                  height: '75px',
                  padding: '25px'
                }}
              >
                <Slider
                  min={1}
                  max={50}
                  marks={marks}
                  step={undefined}
                  onChange={FRState.changeBuffer}
                  defaultValue={25}
                />
              </div>
            )}
            <div style={dimensions}>
              <XComponentReact
                tag='forest-report-feature-profile'
                url={`${process.env.NEXT_PUBLIC_FR_API}/xembed?apiKey=${process.env.NEXT_PUBLIC_FR_API_KEY}`}
                containerProps={{
                  style: {
                    width: '100%',
                    height: '100%'
                  }
                }}
                dimensions={{
                  width: '100%',
                  height: '100%'
                }}
                remainingThreshold={FRRemainingThreshold || 80}
                geom={geom}
                onLoad={(config: Record<string, any>) => {
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
  ) : (
    <></>
  )
}
export default ForestReportEmbed
