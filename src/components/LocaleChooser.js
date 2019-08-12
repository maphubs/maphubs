// @flow
import React from 'react'
import MapHubsComponent from '../components/MapHubsComponent'
import LocaleActions from '../actions/LocaleActions'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import localeUtil from '../locales/util'
import { Menu, Dropdown, Icon } from 'antd'
import getConfig from 'next/config'
const debug = debugFactory('MapHubsComponent')

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

type Props = {
  id: string
};

type State = {
  locale: string
}

export default class LocaleChooser extends MapHubsComponent<Props, State> {
  static defaultProps = {
    id: 'locale-dropdown'
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (this.state.locale !== nextState.locale) {
      return true
    }
    return false
  }

  onChange = (e: Object) => {
    debug.log('LOCALE CHANGE: ' + e.target.id)
    LocaleActions.changeLocale(e.target.id)
  }

  render () {
    const label = localeUtil.getConfig(this.state.locale).label
    const menu = (
      <Menu>
        {langs.map(l => {
          return (
            <Menu.Item key={`locale-${l.value}`}>
              <a href='#!' id={l.value} onClick={this.onChange}>{`${l.name} (${l.label})`}</a>
            </Menu.Item>
          )
        })}
      </Menu>
    )
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <a className='nav-link-item' href='#'>
          {label} <Icon type='down' />
        </a>
      </Dropdown>
    )
  }
}
