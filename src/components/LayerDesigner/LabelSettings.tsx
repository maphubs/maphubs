import React, { useState } from 'react'
import { Row } from 'antd'
import Formsy from 'formsy-react'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import MapStyles from '../Maps/Map/Styles'
import { Layer } from '../../types/layer'
import { useEffect } from 'react'
import useT from '../../hooks/useT'
export type Labels = {
  enabled: boolean
  field: string
}
type Props = {
  onChange: (style: mapboxgl.Style, values: Labels) => void
  layer: Layer
  initialStyle: mapboxgl.Style
  labels: Labels
}

const LabelSettings = ({
  labels,
  initialStyle,
  layer,
  onChange
}: Props): JSX.Element => {
  const { t } = useT()
  const [enabled, setEnabled] = useState(!!labels.enabled)
  const [field, setField] = useState(labels.field || '')
  const [style, setStyle] = useState(initialStyle)

  // allow external style change, like from a different layer setting like Markers
  useEffect(() => {
    setStyle(initialStyle)
  }, [initialStyle])

  const onFormChange = (values: Labels): void => {
    let style

    if (values.enabled && values.field) {
      // add labels to style
      style = MapStyles.labels.addStyleLabels(
        style,
        values.field,
        layer.layer_id,
        layer.shortid,
        layer.data_type
      )
      setStyle(style)
      setField(values.field)
      setEnabled(true)

      onChange(style, values)
    } else if (values.enabled && !values.field) {
      setEnabled(true)
    } else {
      // remove labels from style
      style = MapStyles.labels.removeStyleLabels(style)
      setStyle(style)
      setEnabled(true)
      onChange(style, values)
    }
  }

  const fieldOptions = []
  let presets

  if (layer.style && layer.style.sources) {
    const sourceKeys = Object.keys(layer.style.sources)

    if (sourceKeys.length > 0) {
      const firstSource = Object.keys(layer.style.sources)[0]
      presets = MapStyles.settings.getSourceSetting(
        style,
        firstSource,
        'presets'
      )
    }
  }

  if (presets) {
    for (const preset of presets) {
      fieldOptions.push({
        value: preset.tag,
        label: t(preset.label)
      })
    }
  } else {
    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <p>{t('Not available for this layer')}</p>
      </Row>
    )
  }

  return (
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Formsy onChange={onFormChange}>
        <Row
          style={{
            marginTop: '10px',
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Row>
            <b>{t('Enable Labels')}</b>
          </Row>
          <Row>
            <Toggle
              name='enabled'
              labelOff={t('Off')}
              labelOn={t('On')}
              checked={enabled}
            />
          </Row>
        </Row>
        <Row
          style={{
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Select
            name='field'
            id='label-field-select'
            label={t('Label Field')}
            options={fieldOptions}
            value={field}
            startEmpty={!field}
            tooltipPosition='right'
            tooltip={t('Data field to use in map labels.')}
            required
          />
        </Row>
      </Formsy>
      {enabled && !field && (
        <p
          style={{
            color: 'red'
          }}
        >
          {t('Please Select a Label Field')}
        </p>
      )}
    </Row>
  )
}
export default LabelSettings
