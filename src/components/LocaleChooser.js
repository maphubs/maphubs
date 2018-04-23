// @flow
import React from 'react'
import MapHubsComponent from '../components/MapHubsComponent'
import LocaleActions from '../actions/LocaleActions'
import debugFactory from '../services/debug'
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

  componentDidMount () {
    try {
      M.Dropdown.init(this.dropdown, {
        inDuration: 300,
        outDuration: 225,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        coverTrigger: false, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
      })
    } catch (err) {
      debug.error(err)
    }
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
    const options = {
      'en': {label: 'EN'},
      'fr': {label: 'FR'},
      'es': {label: 'ES'},
      'it': {label: 'IT'}
    }

    const label = options[this.state.locale] ? options[this.state.locale].label : 'UNK'

    return (
      <li className='nav-link-wrapper nav-dropdown-link-wrapper'>
        <a
          ref={(el) => { this.dropdown = el }}
          id='local-chooser-trigger'
          className='locale-dropdown-button nav-dropdown-button dropdown-trigger'
          href='#!'
          data-target='local-chooser'
          style={{paddingRight: 0}}>{label}
          <i className='material-icons right' style={{marginLeft: 0}}>arrow_drop_down</i>
        </a>
        <ul id='local-chooser' className='dropdown-content'>
          <li><a href='#!' id='en' onClick={this.onChange} className='nav-hover-menu-item'>English (EN)</a></li>
          <li><a href='#!' id='fr' onClick={this.onChange} className='nav-hover-menu-item'>Français (FR)</a></li>
          <li><a href='#!' id='es' onClick={this.onChange} className='nav-hover-menu-item'>Español (ES)</a></li>
          <li><a href='#!' id='it' onClick={this.onChange} className='nav-hover-menu-item'>Italiano (IT)</a></li>
        </ul>
      </li>
    )
  }
}
