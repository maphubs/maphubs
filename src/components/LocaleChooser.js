//@flow
import React from 'react';
import MapHubsComponent from '../components/MapHubsComponent';
import UserStore from '../stores/UserStore';
import LocaleActions from '../actions/LocaleActions';
import LocaleStore from '../stores/LocaleStore';
//var Locales = require('../services/locales');
var $ = require('jquery');

export default class LocaleChooser extends MapHubsComponent {

  props: {
    id: string
  }

  static defaultProps: {
    id: 'locale-dropdown'
  }

  constructor(props: Object){
		super(props);
		this.stores = [LocaleStore, UserStore];
	}

  componentDidMount() {
     $('.locale-tooltip').tooltip();
    $(this.refs.dropdownButton).dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object){
    if(this.state.locale != nextState.locale){
      return true;
    }
    return false;
  }

  onChange(locale: string){
    LocaleActions.changeLocale(locale);
    $(this.refs.dropdownMenu).hide();
  }

  render() {

    var _this = this;

    var options = {
      'en':  {label: 'EN'},
      'fr': {label: 'FR'},
      'es': {label: 'ES'},
      'it': {label: 'IT'}
    };

    return (
      <li className="nav-link-wrapper nav-dropdown-link-wrapper locale-tooltip"
        data-position="bottom" data-delay="50" data-tooltip={this.__('Change Language')}>
        <a ref="dropdownButton" className="locale-dropdown-button nav-dropdown-button"
          href="#!" data-activates={this.props.id} style={{paddingRight: 0}}>{options[this.state.locale].label}
          <i className="material-icons right" style={{marginLeft: 0}}>arrow_drop_down</i></a>
          <ul ref="dropdownMenu" id={this.props.id} className="dropdown-content">
            <li><a href="#!" onClick={function(){_this.onChange('en');}} className="nav-hover-menu-item">English (EN)</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('fr');}} className="nav-hover-menu-item">Français (FR)</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('es');}} className="nav-hover-menu-item">Español (ES)</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('it');}} className="nav-hover-menu-item">Italiano (IT)</a></li>
          </ul>
      </li>

    );

  }
}

