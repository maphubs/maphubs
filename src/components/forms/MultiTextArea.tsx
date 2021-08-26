import React, { useState } from 'react'
import TextArea from './textArea'

import _isequal from 'lodash.isequal'
import { Tabs, Tooltip } from 'antd'
import localeUtil from '../../locales/util'

import { LocalizedString } from '../../types/LocalizedString'
import { useEffect } from 'react'
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
  value?: LocalizedString
  label: LocalizedString
  length: number
  successText?: string
  disabled?: boolean
  icon?: React.ReactNode
  tooltip: string
  dataDelay: number
  tooltipPosition: string
  name: string
  required: boolean
  type: string
  style: Record<string, any>
  showCharCount?: boolean
  onClick?: (...args: Array<any>) => any
  validations?: string
  validationErrors?: Record<string, any>
}
type State = {
  value: LocalizedString
}
const MultiTextArea = ({
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
  value,
  name,
  label
}: Props): JSX.Element => {
  const { t } = useT()

  let tempValue: LocalizedString = localeUtil.getEmptyLocalizedString()
  if (typeof value === 'string') {
    tempValue.en = value
  } else if (value) {
    tempValue = value
  }
  const [localValue, setLocalValue] = useState(tempValue)

  useEffect(() => {
    if (value && !_isequal(value, localValue)) {
      if (value) {
        setLocalValue(value)
      } else {
        setLocalValue(localeUtil.getEmptyLocalizedString())
      }
    }
  }, [localValue, value])

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
                name={`${name}-${locale.value}`}
                value={localValue[locale.value]}
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
MultiTextArea.defaultProps = {
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
export default MultiTextArea
