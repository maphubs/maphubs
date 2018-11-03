//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
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
  geojson?: Object
}

export default class FeatureLocation extends MapHubsPureComponent<Props, void> {
  render () {
    const {geojson} = this.props
    if (!geojson) {
      return (
        <div className='row'>
          <h5>{this.__('Data Not Available')}</h5>
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
            <b>{this.__('Latitude:')}</b>&nbsp;
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={lat} />
            </IntlProvider>&nbsp;
          </span>
          <span>
            <b>{this.__('Longitude:')}</b>&nbsp;
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={lon} />
            </IntlProvider>&nbsp;
          </span>
        </div>
        <div className='row no-margin'>
          <span>
            <b>{this.__('Plus Code:')}</b>&nbsp;
            {plusCode} (<a href='https://plus.codes/' target='_blank'>{this.__('More Info')}</a>)
          </span>
        </div>
        <div className='row no-margin'>
          <span>
            <b>{this.__('UTM:')}</b>&nbsp;
            {utm.properties.zoneNumber}{utm.properties.zoneLetter}&nbsp;
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={utm.geometry.coordinates[0]} />
            </IntlProvider>m E&nbsp;
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={utm.geometry.coordinates[1]} />
            </IntlProvider>m N
          </span>
        </div>
      </div>
    )
  }
}
