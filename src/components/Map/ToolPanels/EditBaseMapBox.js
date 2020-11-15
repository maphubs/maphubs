// @flow
import type {Element} from "React";import React from 'react'
import { Button, List } from 'antd'

type Props = {|
  gpxLink?: string,
  t: Function
|}

export default class EditBaseMapBox extends React.PureComponent<Props, void> {
  getLinks: (() => {|loggingroads: string, osm: string|}) = () => {
    const origHash = window.location.hash.replace('#', '')
    const hashParts = origHash.split('/')
    const zoom = Math.round(hashParts[0])
    const lon = hashParts[1]
    const lat = hashParts[2]
    let osmEditLink = 'https://www.openstreetmap.org/edit#map=' + zoom + '/' + lon + '/' + lat
    let loggingRoadsEditLink = 'https://edit.osm.earth/#map=' + zoom + '/' + lon + '/' + lat
    if (this.props.gpxLink) {
      osmEditLink += '&gpx=' + this.props.gpxLink
      loggingRoadsEditLink += '&gpx=' + this.props.gpxLink
    }
    return {
      osm: osmEditLink,
      loggingroads: loggingRoadsEditLink
    }
  }

  openOSM: (() => void) = () => {
    const links = this.getLinks()
    window.location = links.osm
  }

  openLoggingRoads: (() => void) = () => {
    const links = this.getLinks()
    window.location = links.loggingroads
  }

  render (): Element<"div"> {
    const {t} = this.props
    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        <p style={{padding: '5px'}}>Edit OpenStreetMap at this location</p>
        <List size='large'>
          <List.Item>
            <Button type='primary' onClick={this.openOSM}>{t('OpenStreetMap')}</Button>
          </List.Item>
          <List.Item>
            <Button type='primary' onClick={this.openLoggingRoads}>{t('OSM Earth')}</Button>
          </List.Item>
        </List>
      </div>
    )
  }
}
