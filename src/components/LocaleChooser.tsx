import React from 'react'
import useT from '../hooks/useT'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import localeUtil from '../locales/util'
import { DownOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'
import getConfig from 'next/config'
const debug = debugFactory('LocaleChooser')
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

const LocaleChooser = (): JSX.Element => {
  const { t, locale, setLocale } = useT()

  const label = localeUtil.getConfig(locale).label
  const menu = (
    <Menu>
      {langs.map((l) => {
        return (
          <Menu.Item key={`locale-${l.value}`}>
            <a
              href='#!'
              id={l.value}
              onClick={() => {
                setLocale(l.value)
              }}
            >{`${l.name} (${l.label})`}</a>
          </Menu.Item>
        )
      })}
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <a className='nav-link-item' href='#'>
        {label} <DownOutlined />
      </a>
    </Dropdown>
  )
}
export default LocaleChooser
