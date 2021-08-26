import React from 'react'
import { Button, List } from 'antd'
import { LocalizedString } from '../../../../types/LocalizedString'

const EditBaseMapBox = ({
  t,
  gpxLink
}: {
  t: (v: string | LocalizedString) => string
  gpxLink?: string
}): JSX.Element => {
  const getLinks = () => {
    const origHash = window.location.hash.replace('#', '')
    const hashParts = origHash.split('/')
    const zoom = Math.round(Number.parseInt(hashParts[0]))
    const lon = hashParts[1]
    const lat = hashParts[2]
    let osmEditLink =
      'https://www.openstreetmap.org/edit#map=${zoom}/${lon}/${lat}' +
      zoom +
      '/' +
      lon +
      '/' +
      lat

    if (gpxLink) {
      osmEditLink += `&gpx=${gpxLink}`
    }

    return {
      osm: osmEditLink
    }
  }

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center'
      }}
    >
      <p
        style={{
          padding: '5px'
        }}
      >
        Edit OpenStreetMap at this location
      </p>
      <List size='large'>
        <List.Item>
          <Button
            type='primary'
            onClick={() => {
              const links = getLinks()
              window.location.assign(links.osm)
            }}
          >
            {t('OpenStreetMap')}
          </Button>
        </List.Item>
      </List>
    </div>
  )
}
export default EditBaseMapBox
