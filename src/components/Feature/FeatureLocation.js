//  @flow
import React from 'react'
import {addLocaleData, IntlProvider, FormattedNumber} from 'react-intl'
import turf_centroid from '@turf/centroid'
import {OpenLocationCode} from 'open-location-code'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import id from 'react-intl/locale-data/id'
import pt from 'react-intl/locale-data/pt'
addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)
addLocaleData(id)
addLocaleData(pt)

const openLocationCode = new OpenLocationCode()

type Props = {
  geojson?: Object,
  t: Function,
  locale: string
}

export default class FeatureLocation extends React.PureComponent<Props, void> {
  render () {
    const {geojson, t, locale} = this.props
    if (!geojson) {
      return (
        <div className='row'>
          <h5>{t('Data Not Available')}</h5>
        </div>
      )
    }
    const centroid = turf_centroid(geojson)

    const utm = require('wgs84-util').LLtoUTM(centroid.geometry)

    const lon = centroid.geometry.coordinates[0]
    const lat = centroid.geometry.coordinates[1]
    const plusCode = openLocationCode.encode(lat, lon, 11)
    return (
      <div className='row'>
        <div className='row no-margin'>
          <span>
            <b>{t('Latitude:')}</b>&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={lat} />
            </IntlProvider>&nbsp;
          </span>
          <span>
            <b>{t('Longitude:')}</b>&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={lon} />
            </IntlProvider>&nbsp;
          </span>
        </div>
        <div className='row no-margin'>
          <span>
            <b>{t('Plus Code:')}</b>&nbsp;
            {plusCode} (<a href='https://plus.codes/' target='_blank'>{t('More Info')}</a>)
          </span>
        </div>
        <div className='row no-margin'>
          <span>
            <b>{t('UTM:')}</b>&nbsp;
            {utm.properties.zoneNumber}{utm.properties.zoneLetter}&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={utm.geometry.coordinates[0]} />
            </IntlProvider>m E&nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={utm.geometry.coordinates[1]} />
            </IntlProvider>m N
          </span>
        </div>
      </div>
    )
  }
}
