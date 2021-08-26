import React from 'react'
import { Row } from 'antd'
import turf_area from '@turf/area'
import { IntlProvider, FormattedNumber } from 'react-intl'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { FeatureCollection } from 'geojson'
import useT from '../../hooks/useT'
const debug = DebugService('feature-area')
type Props = {
  geojson?: FeatureCollection
}
const comparisons = [
  {
    name: {
      en: 'Grand Canyons'
    },
    ha: 313_994.62
  },
  {
    name: {
      en: 'Rhode Islands'
    },
    ha: 313_994.62
  },
  {
    name: {
      en: 'Luxembourgs'
    },
    ha: 258_827.87
  },
  {
    name: {
      en: 'Washington, DCs'
    },
    ha: 17_699.98
  },
  {
    name: {
      en: 'Manhattans'
    },
    ha: 5910.35
  },
  {
    name: {
      en: 'Central Parks'
    },
    ha: 341.1
  },
  {
    name: {
      en: 'Louvre Museums'
    },
    ha: 6.06
  },
  {
    name: {
      en: 'Football (soccer) Pitches'
    },
    ha: 0.71
  },
  {
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
    // eslint-disable-next-line unicorn/no-array-for-each
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
const FeatureArea = ({ geojson }: Props): JSX.Element => {
  const { t, locale } = useT()
  let featureAreaM2, featureAreaKM2, featureAreaHA

  try {
    featureAreaM2 = turf_area(geojson)
  } catch (err) {
    debug.error(err.message)
  }

  if (featureAreaM2 && featureAreaM2 > 0) {
    featureAreaKM2 = featureAreaM2 * 0.000_001
    featureAreaHA = featureAreaM2 / 10_000
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
        <Row>
          <span>
            <IntlProvider locale={locale}>
              <FormattedNumber value={value} />
            </IntlProvider>
            &nbsp;{units}
          </span>
          <br />
          <span>
            <IntlProvider locale={locale}>
              <FormattedNumber value={featureAreaHA} />
            </IntlProvider>
            &nbsp;ha
          </span>
        </Row>
        <Row>
          <span>
            (or &nbsp;
            <IntlProvider locale={locale}>
              <FormattedNumber value={comparison.val} />
            </IntlProvider>
            &nbsp;{t(comparison.name)})
          </span>
        </Row>
      </div>
    )
  }
  return null
}
export default FeatureArea
