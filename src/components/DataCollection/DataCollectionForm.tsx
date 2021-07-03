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
    const { state } = this
    let submitText = ''

    if (props.submitText) {
      submitText = props.submitText
    } else if (state && state.locale) {
      submitText = Locales.getLocaleString(state.locale, 'Submit')
    } else {
      submitText = 'Submit'
    }

    this.state = {
      canSubmit: false,
      submitText
    }
  }

  onSubmit = (model: Record<string, any>): void => {
    if (this.props.onSubmit) this.props.onSubmit(model)
  }
  onValid = (): void => {
    this.setState({
      canSubmit: true
    })
    if (this.props.onValid) this.props.onValid()
  }
  onInValid = (): void => {
    this.setState({
      canSubmit: false
    })
    if (this.props.onInValid) this.props.onInValid()
  }
  onChange = (model: Record<string, any>): void => {
    if (this.props.onChange) this.props.onChange(model)
  }

  render(): JSX.Element {
    const { t, props, state, onSubmit, onChange, onValid, onInValid } = this
    const { style, showSubmit, presets, values } = props
    const { canSubmit, submitText } = state

    return (
      <div style={style}>
        <Formsy
          onValidSubmit={onSubmit}
          onChange={onChange}
          onValid={onValid}
          onInvalid={onInValid}
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
          {showSubmit && (
            <div
              style={{
                float: 'right'
              }}
            >
              <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                {submitText}
              </Button>
            </div>
          )}
        </Formsy>
      </div>
    )
  }
}
