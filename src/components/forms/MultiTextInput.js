// @flow
import React from 'react'
import TextInput from './textInput'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import {Tabs, Tooltip} from 'antd'

import localeUtil from '../../locales/util'

import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const supportedLangs = localeUtil.getSupported()
let languagesFromConfig
const langs = []
if (MAPHUBS_CONFIG.LANGUAGES) {
  languagesFromConfig = MAPHUBS_CONFIG.LANGUAGES.split(',')
  languagesFromConfig = languagesFromConfig.map(lang => lang.trim())
  supportedLangs.map(lang => {
    if (languagesFromConfig.includes(lang.value)) {
      langs.push(lang)
    }
  })
}

const TabPane = Tabs.TabPane

type Props = {
  id: string,
  value?: LocalizedString,
  label: LocalizedString,
  length: number,
  successText: string,
  disabled: boolean,
  className?: string,
  dataTooltip?: string,
  dataDelay?: number,
  dataPosition?: string,
  name: string,
  required: boolean,
  placeholder?: string,
  type: string,
  style: Object,
  showCharCount: boolean,
  useMaterialize: boolean,
  onClick?: Function,
  validations: string,
  validationErrors: Object
}

type State = {
  value: LocalizedString
}

export default class MultiTextInput extends MapHubsComponent<Props, State> {
  static defaultProps = {
    length: 100,
    successText: '',
    disabled: false,
    dataDelay: 100,
    type: 'text',
    style: {},
    showCharCount: true,
    useMaterialize: true,
    validations: '',
    validationErrors: {}
  }

  constructor (props: Props) {
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

  componentWillReceiveProps (nextProps: Props) {
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

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props.value, nextProps.value)) {
      return true
    }
    if (!_isequal(this.state.value, nextState.value)) {
      return true
    }
    return false
  }

  changeValue = (model: Object) => {
    this.setState({
      value: model
    })
  }

  render () {
    const commonProps = {
      length: this.props.length,
      showCharCount: this.props.showCharCount,
      dataPosition: this.props.dataPosition,
      dataTooltip: this.props.dataTooltip,
      dataDelay: this.props.dataDelay,
      validations: this.props.validations,
      validationErrors: this.props.validationErrors,
      successText: this.props.successText
    }

    return (
      <Tabs
        type='card'
        tabBarStyle={{marginBottom: 0}}
        animated={false}
      >
        {langs.map(locale => {
          return (
            <TabPane
              tab={<Tooltip title={locale.name}><span>{locale.label}</span></Tooltip>}
              key={locale.value}
            >
              <div style={{border: '1px solid #ddd', padding: '10px'}}>
                <TextInput
                  name={`${this.props.name}-${locale.value}`}
                  value={this.state.value[locale.value]}
                  label={this.props.label[locale.value]}
                  required={this.props.required}
                  {...commonProps}
                />
              </div>
            </TabPane>
          )
        })}
      </Tabs>
    )
  }
}
