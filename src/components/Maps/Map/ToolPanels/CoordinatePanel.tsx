import React, { useState } from 'react'
import { Button, Input, Row } from 'antd'
import useMapT from '../../hooks/useMapT'
import { useSelector } from '../../redux/hooks'
import { selectMapboxMap } from '../../redux/reducers/mapSlice'

const CoordinatePanel = (): JSX.Element => {
  const { t } = useMapT()
  const [lat, setLat] = useState<string>()
  const [lon, setLon] = useState<string>()

  const mapboxMap = useSelector(selectMapboxMap)

  const zoomToCoordinates = (lat: number, lon: number) => {
    mapboxMap.flyTo({
      center: [lon, lat],
      zoom: mapboxMap.getZoom()
    })
  }

  return (
    <Row
      justify='center'
      align='middle'
      style={{
        textAlign: 'center'
      }}
    >
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
          type='text'
          value={lon ? lon.toString() : undefined}
          placeholder={t('Longitude')}
          onChange={(e) => {
            const val = e.target.value
            setLon(val)
          }}
        />
      </Row>
      <Row
        justify='center'
        style={{
          marginTop: '20px',
          textAlign: 'center'
        }}
      >
        <Button
          type='primary'
          disabled={!lat || !lon}
          onClick={() => {
            if (lat && lon) {
              zoomToCoordinates(Number.parseFloat(lat), Number.parseFloat(lon))
            }
          }}
        >
          {t('Update Map')}
        </Button>
      </Row>
    </Row>
  )
}

export default CoordinatePanel
