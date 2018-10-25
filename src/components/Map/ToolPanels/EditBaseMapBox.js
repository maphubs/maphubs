// @flow
import React from 'react'
import { Button, List } from 'antd'

type Props = {|
  gpxLink?: string,
  t: Function
|}

export default class EditBaseMapBox extends React.PureComponent<Props, void> {
  getLinks = () => {
    const origHash = window.location.hash.replace('#', '')
    const hashParts = origHash.split('/')
    const zoom = Math.round(hashParts[0])
    const lon = hashParts[1]
    const lat = hashParts[2]
    let osmEditLink = 'https://www.openstreetmap.org/edit#map=' + zoom + '/' + lon + '/' + lat
    let loggingRoadsEditLink = 'http://id.loggingroads.org/#map=' + zoom + '/' + lat + '/' + lon
    if (this.props.gpxLink) {
      osmEditLink += '&gpx=' + this.props.gpxLink
      loggingRoadsEditLink += '&gpx=' + this.props.gpxLink
    }
    return {
      osm: osmEditLink,
      loggingroads: loggingRoadsEditLink
    }
  }

  openOSM = () => {
    const links = this.getLinks()
    window.location = links.osm
  }

  openLoggingRoads = () => {
    const links = this.getLinks()
    window.location = links.loggingroads
  }

  render () {
    const {t} = this.props
    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        <p style={{padding: '5px'}}>Edit OpenStreetMap at this location</p>
        <List size='large'>
          <List.Item>
            <Button type='primary' onClick={this.openOSM}>{t('OpenStreetMap')}</Button>
          </List.Item>
          <List.Item>
            <Button type='primary' onClick={this.openLoggingRoads}>{t('LoggingRoads')}</Button>
          </List.Item>
        </List>
      </div>
    )
  }
}
