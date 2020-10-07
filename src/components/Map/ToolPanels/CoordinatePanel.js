// @flow
import React, {useState} from 'react'
import { Button, Input, Row } from 'antd'

type Props = {|
  zoomToCoordinates: Function,
  t: Function
|}

const CoordinatePanel = ({t, zoomToCoordinates}: Props) => {
  const [lat, setLat] = useState()
  const [lon, setLon] = useState()
  return (
    <Row justify='center' align='middle' style={{textAlign: 'center'}}>
      <b>{t('Enter Coordinates')}</b>
      <Row justify='center'>
        <Input
          value={lat}
          placeholder={t('Latitude')}
          onChange={(e) => {
            const val = e.target.value
            setLat(val)
          }}
        />
      </Row>
      <Row justify='center'>
        <Input
          type='text' value={lon ? lon.toString() : undefined}
          placeholder={t('Longitude')}
          onChange={(e) => {
            const val = e.target.value
            setLon(val)
          }}
        />
      </Row>
      <Row justify='center' style={{marginTop: '20px', textAlign: 'center'}}>
        <Button
          type='primary'
          disabled={!lat || !lon}
          onClick={() => {
            if (lat && lon) {
              zoomToCoordinates(Number.parseFloat(lat), Number.parseFloat(lon))
            }
          }}
        >{t('Update Map')}
        </Button>
      </Row>
    </Row>
  )
}
export default CoordinatePanel
