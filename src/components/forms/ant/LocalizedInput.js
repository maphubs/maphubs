//  @flow
import * as React from 'react'
import { Input, Tabs, Tooltip } from 'antd'
import localeUtil from '../../../locales/util'

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
const { TextArea } = Input

type Props = {
  value?: Object,
  onChange?: Function,
  placeholder?: string,
  type: string
}

type State = {
  value: Object
}

export default class LocalizedInput extends React.Component<Props, State> {
  static defaultProps = {
    type: 'input'
  }

  constructor (props: Props) {
    super(props)
    const value = props.value || {}
    this.state = { value }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    let shouldUpdate = false
    langs.forEach(lang => {
      if (nextState.value[lang.value] !== this.state.value[lang.value]) {
        shouldUpdate = true
      }
    })
    return shouldUpdate
  }

  handleChange = (lang: string, val: string) => {
    const changedValue = {}
    changedValue[lang] = val

    this.setState({
      value: Object.assign({}, this.state.value, changedValue)
    })

    const onChange = this.props.onChange
    if (onChange) {
      onChange(Object.assign({}, this.state.value, changedValue))
    }
  }

  render () {
    const {value} = this.state
    const {placeholder, type} = this.props
    const {handleChange} = this
    return (
      <>
        <style jsx>{`

          .localized-input {
            padding-bottom: 0px;
            width: 100%;
          }
          
        `}
        </style>
        <div className='localized-input'>
          <Tabs animated={false} size='small' tabBarStyle={{margin: 0}}>
            {langs.map(locale => {
              return (
                <TabPane
                  tab={<Tooltip title={locale.name}><span>{locale.label}</span></Tooltip>}
                  key={locale.value}
                >
                  {type === 'input' &&
                    <Input
                      type='text' value={value[locale.value]}
                      placeholder={placeholder}
                      onChange={(e) => {
                        const val = e.target.value
                        handleChange(locale.value, val)
                      }}
                    />}
                  {type === 'area' &&
                    <TextArea
                      rows={4} type='text' value={value[locale.value]}
                      placeholder={placeholder}
                      onChange={(e) => {
                        const val = e.target.value
                        handleChange(locale.value, val)
                      }}
                    />}
                </TabPane>
              )
            })}
          </Tabs>
        </div>
      </>
    )
  }
}
