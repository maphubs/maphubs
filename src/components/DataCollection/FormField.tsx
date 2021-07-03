import React from 'react'
import { Row } from 'antd'
import TextInput from '../forms/textInput'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
type Props = {
  preset: Record<string, any>
  value: any
  t: (...args: Array<any>) => any
}
const FormField = ({ preset, value, t }: Props): JSX.Element => {
  let field = (
    <TextInput
      name={preset.tag}
      label={t(preset.label)}
      required={preset.isRequired}
      showCharCount={false}
      value={value}
      t={t}
    />
  )

  // TODO: add localized string support
  switch (preset.type) {
    case 'number': {
      field = (
        <TextInput
          name={preset.tag}
          label={t(preset.label)}
          validations='isNumeric'
          validationErrors={{
            isNumeric: t('Value must be a number')
          }}
          required={preset.isRequired}
          value={value}
          t={t}
        />
      )

      break
    }
    case 'radio':
    case 'combo': {
      const options = []

      if (preset.options) {
        for (let option of preset.options.split(',')) {
          option = option.trim()
          options.push({
            value: option,
            label: option
          })
        }
      }

      field = (
        <Select
          name={preset.tag}
          id={'select-' + preset.tag}
          label={t(preset.label)}
          options={options}
          startEmpty={!value}
          required={preset.isRequired}
          value={value}
        />
      )

      break
    }
    case 'check': {
      field = (
        <Toggle
          name={preset.tag}
          labelOff=''
          labelOn={t(preset.label)}
          checked={value}
        />
      )

      break
    }
    // No default
  }

  return <Row>{field}</Row>
}
export default FormField
