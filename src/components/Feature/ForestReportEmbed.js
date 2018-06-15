// @flow
import React from 'react'
import XComponentReact from '../XComponentReact'

type FRModule = {
  id: string,
  name: Object,
  style: Object,
  data: Object // payload data, varies based on module
}

type FRData = {
  modules: Array<FRModule>
}

type Props = {|
  geoJSON: Object,
  onLoad: Function,
  onAlertClick: Function,
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

    const {geoJSON, onLoad, onModuleToggle, onAlertClick} = this.props

    if (!geoJSON || !geoJSON.features ||
        geoJSON.features.length === 0 ||
        geoJSON.features[0].type === 'Point'
    ) {
      return (
        <p>Invalid Feature</p>
      )
    }

    const geom = geoJSON.features[0].geometry
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
