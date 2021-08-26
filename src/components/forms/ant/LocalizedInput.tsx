import React, { useState } from 'react'
import { Input, Tabs, Tooltip } from 'antd'
import localeUtil from '../../../locales/util'

import { LocalizedString } from '../../../types/LocalizedString'

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
const { TextArea } = Input
type Props = {
  initialValue?: LocalizedString
  onChange?: (...args: Array<any>) => any
  placeholder?: string
  type?: string
}
type State = {
  value: Record<string, any>
}
const LocalizedInput = ({
  initialValue,
  type,
  placeholder,
  onChange
}: Props): JSX.Element => {
  const [value, setValue] = useState(initialValue || {})

  const handleChange = (lang: string, val: string) => {
    const changedValue = {}
    changedValue[lang] = val
    const updatedValue = { ...value, ...changedValue }
    setValue(updatedValue)
    if (onChange) onChange(updatedValue)
  }

  return (
    <>
      <style jsx>
        {`
          .localized-input {
            padding-bottom: 0px;
            width: 100%;
          }
        `}
      </style>
      <div className='localized-input'>
        <Tabs
          animated={false}
          size='small'
          tabBarStyle={{
            margin: 0
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
                {type === 'input' && (
                  <Input
                    type='text'
                    value={value[locale.value]}
                    placeholder={placeholder}
                    onChange={(e) => {
                      const val = e.target.value
                      handleChange(locale.value, val)
                    }}
                  />
                )}
                {type === 'area' && (
                  <TextArea
                    rows={4}
                    value={value[locale.value]}
                    placeholder={placeholder}
                    onChange={(e) => {
                      const val = e.target.value
                      handleChange(locale.value, val)
                    }}
                  />
                )}
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    </>
  )
}
LocalizedInput.defaultProps = {
  type: 'input'
}
export default LocalizedInput
