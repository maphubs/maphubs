// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'

import _isequal from 'lodash.isequal'

type Props = {
    id: string,
    sidenav: boolean
  }

export default class ExploreDropdown extends MapHubsComponent<Props, void> {
  props: Props
  exploreButton: any

  static defaultProps: Props = {
    id: 'explore-dropdown',
    sidenav: false
  }

  componentDidMount () {
    this.initDropdown()
  }

  shouldComponentUpdate (nextProps: Props) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  initDropdown = () => {
    if (!this.props.sidenav && this.exploreButton) {
      try {
        M.Dropdown.init(this.exploreButton, {
          inDuration: 300,
          outDuration: 225,
          constrainWidth: true, // Does not change width of dropdown to that of the activator
          hover: false, // Activate on hover
          gutter: 0, // Spacing from edge
          coverTrigger: false, // Displays dropdown below the button
          alignment: 'right' // Displays dropdown with edge aligned to the left of button
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  render () {
    const {t} = this
    const {sidenav, id} = this.props
    if (sidenav) {
      return (
        <ul id={id}>
          <li><a href='/explore' className='nav-hover-menu-item'>{t('Explore')}</a></li>
          <li className='divider' />
          <li><a href='/maps' className='nav-hover-menu-item'>{t('Maps')}</a></li>
          <li><a href='/stories' className='nav-hover-menu-item'>{t('Stories')}</a></li>
          <li><a href='/layers' className='nav-hover-menu-item'>{t('Layers')}</a></li>
          <li><a href='/hubs' className='nav-hover-menu-item'>{t('Hubs')}</a></li>
          <li><a href='/groups' className='nav-hover-menu-item'>{t('Groups')}</a></li>
          <li className='divider' />
        </ul>
      )
    } else {
      return (
        <li className='nav-dropdown-link-wrapper nav-link-wrapper'>
          <a
            ref={(el) => { this.exploreButton = el }}
            id={id} href='#!'
            className='dropdown-trigger'
            data-target={`${id}-content`}
            style={{paddingRight: 0}}>{t('Explore')}
            <i className='material-icons right' style={{marginLeft: 0}}>arrow_drop_down</i>
          </a>
          <ul id={`${id}-content`} className='dropdown-content'>
            <li><a href='/explore' className='nav-hover-menu-item'>{t('All')}</a></li>
            <li className='divider' />
            <li><a href='/maps' className='nav-hover-menu-item'>{t('Maps')}</a></li>
            <li><a href='/stories' className='nav-hover-menu-item'>{t('Stories')}</a></li>
            <li><a href='/layers' className='nav-hover-menu-item'>{t('Layers')}</a></li>
            <li><a href='/hubs' className='nav-hover-menu-item'>{t('Hubs')}</a></li>
            <li><a href='/groups' className='nav-hover-menu-item'>{t('Groups')}</a></li>
          </ul>
        </li>
      )
    }
  }
}
