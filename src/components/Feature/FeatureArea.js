//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
import turf_area from '@turf/area'
import {addLocaleData, IntlProvider, FormattedNumber} from 'react-intl'
import DebugService from '../../services/debug'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)

const debug = DebugService('feature-area')

type Props = {
  geojson?: Object
}

const comparisons = [
  {
    name: {
      en: 'Grand Canyons'
    },
    ha: 313994.62
  }, {
    name: {
      en: 'Rhode Islands'
    },
    ha: 313994.62
  }, {
    name: {
      en: 'Luxembourgs'
    },
    ha: 258827.87
  }, {
    name: {
      en: 'Washington, DCs'
    },
    ha: 17699.98
  }, {
    name: {
      en: 'Manhattans'
    },
    ha: 5910.35
  }, {
    name: {
      en: 'Central Parks'
    },
    ha: 341.10
  }, {
    name: {
      en: 'Louvre Museums'
    },
    ha: 6.06
  }, {
    name: {
      en: 'Football (soccer) Pitches'
    },
    ha: 0.71
  }, {
    name: {
      en: 'Tennis Courts'
    },
    ha: 0.02
  }
]

const findComparision = (areaHa: number) => {
  let result
  if (areaHa > comparisons[0].ha) {
    result = {
      name: comparisons[0].name,
      val: areaHa / comparisons[0].ha
    }
  } else {
    comparisons.forEach((comparison, i) => {
      if (!result && areaHa > comparison.ha) {
        if (i === 0) {
          result = {
            name: comparisons[0].name,
            val: areaHa / comparisons[0].ha
          }
        } else if (i === comparisons.length - 1) {
          result = {
            name: comparisons[i - 1].name,
            val: areaHa / comparisons[i - 1].ha
          }
        } else {
          result = {
            name: comparison.name,
            val: areaHa / comparison.ha
          }
        }
      }
    })
    if (!result) {
      const last = comparisons.length - 1
      result = {
        name: comparisons[last].name,
        val: areaHa / comparisons[last].ha
      }
    }
  }
  return result
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
      const comparison = findComparision(featureAreaHA)

      return (
        <div>
          <div className='row no-margin'>
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
          <div className='row no-margin'>
            <span>
              (or &nbsp;
              <IntlProvider locale={this.state.locale}>
                <FormattedNumber value={comparison.val} />
              </IntlProvider>&nbsp;{this._o_(comparison.name)})
            </span>
          </div>
        </div>
      )
    }
    return null
  }
}
