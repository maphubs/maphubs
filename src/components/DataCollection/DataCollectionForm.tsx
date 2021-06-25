import type { Element } from 'React'
import React from 'react'
import { Button } from 'antd'
import Formsy from 'formsy-react'
import FormField from './FormField'

import Locales from '../../services/locales'
type Props = {
  presets: Array<Record<string, any>>
  values?: Record<string, any>
  showSubmit: boolean
  onSubmit?: (...args: Array<any>) => any
  onValid?: (...args: Array<any>) => any
  onInValid?: (...args: Array<any>) => any
  onChange?: (...args: Array<any>) => any
  submitText?: string
  style?: Record<string, any>
}
type State = {
  canSubmit: boolean
  submitText: string
}
export default class DataCollectionForm extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        showSubmit: boolean
      } = {
    showSubmit: true
  }

  constructor(props: Props) {
    super(props)
    let submitText = ''

    if (props.submitText) {
      submitText = props.submitText
    } else if (this.state && this.state.locale) {
      submitText = Locales.getLocaleString(this.state.locale, 'Submit')
    } else {
      submitText = 'Submit'
    }

    this.state = {
      canSubmit: false,
      submitText
    }
  }

  onSubmit: any | ((model: any) => void) = (model: Record<string, any>) => {
    if (this.props.onSubmit) this.props.onSubmit(model)
  }
  onValid: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
    if (this.props.onValid) this.props.onValid()
  }
  onInValid: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
    if (this.props.onInValid) this.props.onInValid()
  }
  onChange: any | ((model: any) => void) = (model: Record<string, any>) => {
    if (this.props.onChange) this.props.onChange(model)
  }

  render(): Element<'div'> {
    const { t } = this
    const { style, showSubmit, presets, values } = this.props
    let submit = ''

    if (showSubmit) {
      submit = (
        <div
          style={{
            float: 'right'
          }}
        >
          <Button
            type='primary'
            htmlType='submit'
            disabled={!this.state.canSubmit}
          >
            {this.state.submitText}
          </Button>
        </div>
      )
    }

    return (
      <div style={style}>
        <Formsy
          onValidSubmit={this.onSubmit}
          onChange={this.onChange}
          onValid={this.onValid}
          onInvalid={this.onInValid}
        >
          {presets.map((preset) => {
            let value

            if (values && values[preset.tag]) {
              value = values[preset.tag]
            }

            if (preset.tag !== 'photo_url') {
              return (
                <FormField
                  t={t}
                  key={preset.tag}
                  preset={preset}
                  value={value}
                />
              )
            }
          })}
          {submit}
        </Formsy>
      </div>
    )
  }
}
