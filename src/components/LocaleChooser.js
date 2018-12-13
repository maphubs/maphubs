// @flow
import React from 'react'
import MapHubsComponent from '../components/MapHubsComponent'
import LocaleActions from '../actions/LocaleActions'
import debugFactory from '../services/debug'
import localeUtil from '../locales/util'
import { Menu, Dropdown, Icon } from 'antd'
const debug = debugFactory('MapHubsComponent')

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
        {localeUtil.getSupported().map(l => {
          return (
            <Menu.Item key={`locale-${l.value}`}>
              <a href='#!' id={l.value} onClick={this.onChange} className='nav-hover-menu-item'>{`${l.name} (${l.label})`}</a>
            </Menu.Item>
          )
        })}
      </Menu>
    )
    return (
      <li className='nav-link-wrapper' style={{height: '50px', overflow: 'hidden'}}>
        <Dropdown overlay={menu} trigger={['click']}>
          <a className='nav-link-item' href='#'>
            {label} <Icon type='down' />
          </a>
        </Dropdown>
      </li>
    )
  }
}
