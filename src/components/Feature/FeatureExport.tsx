import React from 'react'
import slugify from 'slugify'
import { Typography } from 'antd'
import useT from '../../hooks/useT'
const { Title } = Typography
type Props = {
  mhid: string
  layer_id: number
  name: string
  disable_export: boolean
  data_type: string
}
const FeatureExport = ({
  mhid,
  layer_id,
  name,
  disable_export,
  data_type
}: Props): JSX.Element => {
  const { t, locale } = useT()
  const geoJSONURL = `/api/feature/json/${layer_id}/${mhid}/${slugify(
    t(name)
  )}.geojson`
  const kmlURL = `/api/feature/kml/${layer_id}/${mhid}/${slugify(
    t(name)
  )}.kml?locale=${locale}`

  if (!disable_export) {
    let gpxExport

    if (data_type === 'polygon') {
      const gpxLink = `/api/feature/gpx/${layer_id}/${mhid}/feature.gpx`
      gpxExport = (
        <li>
          <a href={gpxLink}>{t('GPX')}</a>
        </li>
      )
    }

    return (
      <div>
        <Title level={3}>{t('Export Data')}</Title>
        <ul className='no-margin'>
          <li>
            <a href={geoJSONURL}>{t('GeoJSON')}</a>
          </li>
          <li>
            <a href={kmlURL}>{t('KML')}</a>
          </li>
          {gpxExport}
        </ul>
      </div>
    )
  } else {
    return (
      <div>
        <p>{t('Export is not available for this layer.')}</p>
      </div>
    )
  }
}
export default FeatureExport
