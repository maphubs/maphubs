import React, { useState } from 'react'
import { Button, Row, Select } from 'antd'
import dynamic from 'next/dynamic'
import localeUtil from '../../locales/util'

import { LocalizedString } from '../../types/LocalizedString'
import useT from '../../hooks/useT'
const SimpleCodeEditor = dynamic(() => import('./SimpleCodeEditor'), {
  ssr: false
})

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

const { Option } = Select
type Props = {
  id: string
  onSave: (...args: Array<any>) => any
  title: string
  initialLocalizedCode: LocalizedString
  mode: string
  theme: string
  modal: boolean
}

const LocalizedCodeEditor = ({
  initialLocalizedCode,
  title,
  mode,
  theme,
  onSave
}: Props): JSX.Element => {
  const { t } = useT()
  const [localizedCode, setLocalizedCode] = useState(initialLocalizedCode)
  const [locale, setLocale] = useState('en')
  const [canSave, setCanSave] = useState(true)

  return (
    <div
      style={{
        height: 'calc(100% - 100px)',
        width: '100%'
      }}
    >
      <Row>
        <p className='left no-padding'>{title}</p>
      </Row>
      <Row
        style={{
          marginBottom: '10px'
        }}
      >
        <Select
          defaultValue='en'
          style={{
            width: 120
          }}
          onChange={(locale: string) => {
            setLocale(locale)
          }}
        >
          {langs.map((locale) => (
            <Option key={locale.value} value={locale.value}>
              {locale.label}
            </Option>
          ))}
        </Select>
      </Row>
      <Row
        style={{
          height: 'calc(100% - 100px)'
        }}
      >
        <SimpleCodeEditor
          mode={mode}
          theme={theme}
          name='component-html-editor'
          value={localizedCode[locale]}
          onChange={(val) => {
            localizedCode[locale] = val
            setLocalizedCode(localizedCode)
          }}
        />
      </Row>
      <div
        style={{
          float: 'right'
        }}
      >
        <Button
          type='primary'
          style={{
            float: 'none',
            marginTop: '15px'
          }}
          disabled={!canSave}
          onClick={() => {
            if (canSave) {
              onSave(localizedCode)
            }
          }}
        >
          {t('Save')}
        </Button>
      </div>
    </div>
  )
}
LocalizedCodeEditor.defaultProps = {
  id: 'code-editor',
  mode: 'json',
  theme: 'monokai',
  modal: true
}
export default LocalizedCodeEditor
