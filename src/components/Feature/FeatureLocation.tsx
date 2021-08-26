import React from 'react'
import { Row, Typography } from 'antd'
import { QRCode } from 'react-qr-svg'
import { IntlProvider, FormattedNumber } from 'react-intl'
import turf_centroid from '@turf/centroid'
import { OpenLocationCode } from 'open-location-code'
import WGS84 from 'wgs84-util'
import { LocalizedString } from '../../types/LocalizedString'
const { Title } = Typography

const openLocationCode = new OpenLocationCode()
type Props = {
  geojson?: Record<string, any>
  t: (v: string | LocalizedString) => string
  locale: string
}
const FeatureLocation = ({ geojson, t, locale }: Props): JSX.Element => {
  if (!geojson) {
    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Title level={4}>{t('Data Not Available')}</Title>
      </Row>
    )
  }

  const centroid = turf_centroid(geojson)

  const utm = WGS84.LLtoUTM(centroid.geometry)

  const lon = centroid.geometry.coordinates[0]
  const lat = centroid.geometry.coordinates[1]
  const plusCode = openLocationCode.encode(lat, lon, 11)
  return (
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Row
        style={{
          padding: '5px'
        }}
      >
        <QRCode
          bgColor='#FFFFFF'
          fgColor='#000000'
          level='L'
          style={{
            width: 64
          }}
          value={`geo:${lat},${lon}`}
        />
      </Row>
      <Row>
        <Row>
          <span>
            <b>{t('Latitude:')}</b>&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={lat} minimumFractionDigits={6} />
            </IntlProvider>
            &nbsp;
          </span>
        </Row>
        <Row>
          <span>
            <b>{t('Longitude:')}</b>&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={lon} minimumFractionDigits={6} />
            </IntlProvider>
            &nbsp;
          </span>
        </Row>
      </Row>

      <Row>
        <span>
          <b>{t('UTM:')}</b>&nbsp;
          {utm.properties.zoneNumber}
          {utm.properties.zoneLetter}&nbsp;
          <IntlProvider locale={locale}>
            <FormattedNumber value={utm.geometry.coordinates[0]} />
          </IntlProvider>
          m E&nbsp;
          <IntlProvider locale={locale}>
            <FormattedNumber value={utm.geometry.coordinates[1]} />
          </IntlProvider>
          m N
        </span>
      </Row>
      <Row>
        <span>
          <b>{t('Plus Code:')}</b>&nbsp;
          {plusCode} (
          <a
            href='https://plus.codes/'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('More Info')}
          </a>
          )
        </span>
      </Row>
    </Row>
  )
}
export default FeatureLocation
