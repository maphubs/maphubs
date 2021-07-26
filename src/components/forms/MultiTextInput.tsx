import React, { useState, useEffect } from 'react'
import TextInput from './textInput'

import _isequal from 'lodash.isequal'
import { Tabs, Tooltip } from 'antd'
import localeUtil from '../../locales/util'

import { LocalizedString } from '../../types/LocalizedString'
import useT from '../../hooks/useT'

const supportedLangs = localeUtil.getSupported()
let languagesFromConfig
const langs = []

if (process.env.NEXT_PUBLIC_LANGUAGES) {
  languagesFromConfig = process.env.NEXT_PUBLIC_LANGUAGES.split(',')
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
  initialValue?: LocalizedString
  label: LocalizedString
  length: number
  successText: string
  disabled?: boolean
  className?: string
  tooltip?: string
  dataDelay?: number
  tooltipPosition?: string
  inputName: string
  required: boolean
  placeholder?: string
  type: string
  style: Record<string, any>
  showCharCount: boolean
  onClick?: (...args: Array<any>) => any
  validations: string
  validationErrors: Record<string, any>
  icon?: React.ReactNode
}
type State = {
  value: LocalizedString
}
const MultiTextInput = ({
  initialValue,
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
  inputName,
  label
}: Props): JSX.Element => {
  const { t } = useT()
  const [value, setValue] = useState<LocalizedString>(
    initialValue || localeUtil.getEmptyLocalizedString()
  )

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
              <TextInput
                name={`${inputName}-${locale.value}`}
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
MultiTextInput.defaultProps = {
  length: 100,
  successText: '',
  dataDelay: 100,
  type: 'text',
  style: {},
  showCharCount: true,
  validations: '',
  validationErrors: {}
}
export default MultiTextInput
