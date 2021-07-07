import * as React from 'react'
import TextArea from './textArea'

import _isequal from 'lodash.isequal'
import { Tabs, Tooltip } from 'antd'
import localeUtil from '../../locales/util'
import getConfig from 'next/config'
import { LocalizedString } from '../../types/LocalizedString'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const supportedLangs = localeUtil.getSupported()
let languagesFromConfig
const langs = []

if (MAPHUBS_CONFIG.LANGUAGES) {
  languagesFromConfig = MAPHUBS_CONFIG.LANGUAGES.split(',')
  languagesFromConfig = languagesFromConfig.map((lang) => lang.trim())
  supportedLangs.map((lang) => {
    if (languagesFromConfig.includes(lang.value)) {
      langs.push(lang)
    }
  })
}

const TabPane = Tabs.TabPane
type Props = {
  id: string
  value?: LocalizedString
  label: LocalizedString
  length: number
  successText: string
  disabled: boolean
  icon?: React.ReactNode
  tooltip: string
  dataDelay: number
  tooltipPosition: string
  name: string
  required: boolean
  placeholder: string
  type: string
  style: Record<string, any>
  showCharCount: boolean
  onClick: (...args: Array<any>) => any
  validations: string
  validationErrors: Record<string, any>
}
type State = {
  value: LocalizedString
}
export default class MultiTextArea extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        dataDelay: number
        defaultValue: string
        disabled: boolean
        length: number
        showCharCount: boolean
        style: {}
        successText: string
        type: string
        validationErrors: {}
        validations: string
        value: string
      } = {
    length: 100,
    successText: '',
    defaultValue: '',
    disabled: false,
    value: '',
    dataDelay: 100,
    type: 'text',
    style: {},
    showCharCount: true,
    validations: '',
    validationErrors: {}
  }

  constructor(props: Props) {
    super(props)
    let value: LocalizedString = localeUtil.getEmptyLocalizedString()

    if (typeof props.value === 'string') {
      value.en = props.value
    } else if (props.value) {
      value = props.value
    }

    this.state = {
      value
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (!_isequal(this.props.value, nextProps.value)) {
      if (nextProps.value) {
        this.setState({
          value: nextProps.value
        })
      } else {
        this.setState({
          value: localeUtil.getEmptyLocalizedString()
        })
      }
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  changeValue = (model: Record<string, any>): void => {
    this.setState({
      value: model
    })
  }

  render(): JSX.Element {
    const { t, props, state } = this
    const {
      length,
      required,
      showCharCount,
      tooltipPosition,
      tooltip,
      dataDelay,
      validations,
      validationErrors,
      successText,
      icon,
      label
    } = props

    const { value } = state

    const commonProps = {
      length,
      showCharCount,
      tooltipPosition,
      tooltip,
      dataDelay,
      validations,
      validationErrors,
      successText,
      icon
    }
    return (
      <Tabs
        type='card'
        tabBarStyle={{
          marginBottom: 0
        }}
        animated={false}
        style={{
          width: '100%'
        }}
      >
        {langs.map((locale) => {
          return (
            <TabPane
              tab={
                <Tooltip title={locale.name}>
                  <span>{locale.label}</span>
                </Tooltip>
              }
              key={locale.value}
            >
              <div
                style={{
                  border: '1px solid #ddd',
                  padding: '10px'
                }}
              >
                <TextArea
                  name={`${props.name}-${locale.value}`}
                  value={value[locale.value]}
                  label={label[locale.value]}
                  required={required && locale.value === 'en'}
                  {...commonProps}
                  t={t}
                />
              </div>
            </TabPane>
          )
        })}
      </Tabs>
    )
  }
}
