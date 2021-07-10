import React from 'react'
import { Button, Row, Select } from 'antd'
import dynamic from 'next/dynamic'
import _isequal from 'lodash.isequal'

import localeUtil from '../../locales/util'
import getConfig from 'next/config'
import { LocalizedString } from '../../types/LocalizedString'
const SimpleCodeEditor = dynamic(() => import('./SimpleCodeEditor'), {
  ssr: false
})
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

const { Option } = Select
type Props = {
  id: string
  onSave: (...args: Array<any>) => any
  title: string
  localizedCode: LocalizedString
  mode: string
  theme: string
  modal: boolean
}
type State = {
  localizedCode: LocalizedString
  canSave: boolean
  locale: string
}
export default class LocalizedCodeEditor extends React.Component<Props, State> {
  props: Props
  static defaultProps:
    | any
    | {
        id: string
        modal: boolean
        mode: string
        theme: string
      } = {
    id: 'code-editor',
    mode: 'json',
    theme: 'monokai',
    modal: true
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      localizedCode: props.localizedCode,
      canSave: true,
      locale: 'en'
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      localizedCode: nextProps.localizedCode
    })
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

  onChange = (localizedCode: any): void => {
    this.setState({
      localizedCode
    })
  }

  onSave = (): void => {
    if (this.state.canSave) {
      this.props.onSave(this.state.localizedCode)
    }
  }
  onLocaleChange = (locale: string): void => {
    this.setState({
      locale
    })
  }

  render(): JSX.Element {
    const { t, props, state, onLocaleChange, onSave } = this
    const { title, mode, theme } = props
    const { canSave, localizedCode, locale } = state
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
            onChange={onLocaleChange}
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
              this.onChange(localizedCode)
            }}
            t={t}
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
            onClick={onSave}
          >
            {t('Save')}
          </Button>
        </div>
      </div>
    )
  }
}
