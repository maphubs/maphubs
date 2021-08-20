import React, { useState, useEffect } from 'react'
import Formsy from 'formsy-react'
import { Row } from 'antd'
import Toggle from '../forms/toggle'
import MapStyles from '../Maps/Map/Styles'
import type { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'
import useT from '../../hooks/useT'
type Props = {
  onChange: (style, legend) => void
  layer: Layer
  style: mapboxgl.Style
}
type State = {
  interactive: boolean
  showBehindBaseMapLabels: boolean
  fill: boolean
}

const getStateFromStyleProp = (style: mapboxgl.Style, layer: Layer): State => {
  const defaults = MapStyles.settings.defaultLayerSettings()

  if (layer.layer_id && layer.data_type && style) {
    const glLayerId = style.layers[0].id
    let interactive = defaults.interactive
    const interactiveSetting: any = MapStyles.settings.getLayerSetting(
      style,
      glLayerId,
      'interactive'
    )

    if (typeof interactiveSetting !== 'undefined') {
      interactive = interactiveSetting
    }

    let showBehindBaseMapLabels = defaults.showBehindBaseMapLabels
    const showBehindBaseMapLabelsSetting = MapStyles.settings.getLayerSetting(
      style,
      glLayerId,
      'showBehindBaseMapLabels'
    )

    if (typeof showBehindBaseMapLabelsSetting !== 'undefined') {
      showBehindBaseMapLabels = showBehindBaseMapLabelsSetting
    }

    let fill = defaults.fill
    const fillSetting = MapStyles.settings.getLayerSetting(
      style,
      glLayerId,
      'outline-only'
    )

    if (typeof fillSetting !== 'undefined') {
      fill = !fillSetting
    }

    return {
      interactive,
      showBehindBaseMapLabels,
      fill
    }
  } else {
    return {
      interactive: true,
      showBehindBaseMapLabels: false,
      fill: true
    }
  }
}

const AdvancedLayerSettings = ({
  style,
  layer,
  onChange
}: Props): JSX.Element => {
  const { t } = useT()
  const [settings, setSettings] = useState<State>(
    getStateFromStyleProp(style, layer)
  )

  useEffect(() => {
    setSettings(getStateFromStyleProp(style, layer))
  }, [style, layer])

  const { fill, interactive, showBehindBaseMapLabels } = settings

  const onFormChange = (values: Record<string, any>): void => {
    let legend = layer.legend_html

    if (values.interactive !== interactive) {
      const glLayerId = style.layers[0].id
      style = MapStyles.settings.setLayerSetting(
        style,
        glLayerId,
        'interactive',
        values.interactive
      )
      setSettings({
        interactive: values.interactive,
        showBehindBaseMapLabels,
        fill
      })
    } else if (values.showBehindBaseMapLabels !== showBehindBaseMapLabels) {
      style = MapStyles.settings.setLayerSettingAll(
        style,
        'showBehindBaseMapLabels',
        values.showBehindBaseMapLabels,
        'symbol'
      )
      setSettings({
        showBehindBaseMapLabels: values.showBehindBaseMapLabels,
        interactive,
        fill
      })
    } else if (values.fill !== fill && layer.data_type === 'polygon') {
      style = MapStyles.settings.setLayerSettingAll(
        style,
        'outline-only',
        !values.fill,
        'symbol'
      )
      const result = MapStyles.polygon.toggleFill(style, values.fill)
      style = result.style
      setSettings({
        fill: values.fill,
        showBehindBaseMapLabels,
        interactive
      })

      legend = values.fill
        ? MapStyles.legend.legendWithColor(layer, result.legendColor)
        : MapStyles.legend.outlineLegendWithColor(layer, result.legendColor)
    } else {
      // nochange
      return
    }

    onChange(style, legend)
  }

  return (
    <Row
      style={{
        marginLeft: '10px',
        marginBottom: '20px'
      }}
    >
      <Formsy onChange={onFormChange}>
        {layer.data_type === 'polygon' && (
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Row>
              <b>{t('Fill')}</b>
            </Row>
            <Row>
              <Toggle
                name='fill'
                labelOff={t('Outline Only')}
                labelOn={t('Fill')}
                checked={fill}
                tooltipPosition='right'
                tooltip={t(
                  'Hide polygon fill and only show the outline in the selected color'
                )}
              />
            </Row>
          </Row>
        )}
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Row>
            <b>{t('Interactive')}</b>
          </Row>
          <Row>
            <Toggle
              name='interactive'
              labelOff={t('Off')}
              labelOn={t('On')}
              checked={interactive}
              tooltipPosition='right'
              tooltip={t(
                'Allow users to interact with this layer by clicking the map'
              )}
            />
          </Row>
        </Row>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Row>
            <b>{t('Show Below Base Map Labels')}</b>
          </Row>
          <Row>
            <Toggle
              name='showBehindBaseMapLabels'
              labelOff={t('Off')}
              labelOn={t('On')}
              checked={showBehindBaseMapLabels}
              tooltipPosition='right'
              tooltip={t(
                'Allow base map labels to display on top of this layer'
              )}
            />
          </Row>
        </Row>
      </Formsy>
    </Row>
  )
}
export default AdvancedLayerSettings
