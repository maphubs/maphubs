//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
import turf_area from '@turf/area'
import {addLocaleData, IntlProvider, FormattedNumber} from 'react-intl'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)

const debug = require('../../services/debug')('feature-area')

type Props = {
  geojson?: Object
}

export default class FeatureArea extends MapHubsPureComponent<Props, void> {
  render () {
    let featureAreaM2, featureAreaKM2, featureAreaHA
    try {
      featureAreaM2 = turf_area(this.props.geojson)
    } catch (err) {
      debug.error(err.message)
    }
    if (featureAreaM2 && featureAreaM2 > 0) {
      featureAreaKM2 = featureAreaM2 * 0.000001
      featureAreaHA = featureAreaM2 / 10000.00
      let value, units
      if (featureAreaKM2 < 1) {
        value = featureAreaM2
        units = 'm²'
      } else {
        value = featureAreaKM2
        units = 'km²'
      }
      return (
        <div className='row'>
          <h5>{this.__('Area')}</h5>
          <span>
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={value} />
            </IntlProvider>&nbsp;{units}
          </span>
          <br />
          <span>
            <IntlProvider locale={this.state.locale}>
              <FormattedNumber value={featureAreaHA} />
            </IntlProvider>&nbsp;ha
          </span>
        </div>
      )
    }
    return null
  }
}
