// @flow
import type {Node} from "React";import React from 'react'
import { Row } from 'antd'
import TextInput from '../forms/textInput'
import Toggle from '../forms/toggle'
import Select from '../forms/select'

type Props = {|
  preset: Object,
  value: any,
  t: Function
|}

export default class FormField extends React.Component<Props, void> {
  props: Props

  render (): Node {
    const {preset, value, t} = this.props
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

    if (preset.type === 'number') {
      field = (
        <TextInput
          name={preset.tag}
          label={t(preset.label)}
          validations='isNumeric' validationErrors={{
            isNumeric: t('Value must be a number')
          }}
          required={preset.isRequired}
          value={value}
          t={t}
        />
      )
    } else if (preset.type === 'radio' || preset.type === 'combo') {
      const options = []
      if (preset.options) {
        preset.options.split(',').forEach(option => {
          option = option.trim()
          options.push({value: option, label: option})
        })
      }
      field = (
        <Select
          name={preset.tag} id={'select-' + preset.tag}
          label={t(preset.label)}
          options={options}
          startEmpty={!value}
          required={preset.isRequired}
          value={value}
        />
      )
    } else if (preset.type === 'check') {
      field = (
        <Toggle
          name={preset.tag}
          labelOff='' labelOn={t(preset.label)}
          checked={value}
        />
      )
    }

    return (
      <Row>
        {field}
      </Row>
    )
  }
}
