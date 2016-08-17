var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var UserStore = require('../stores/UserStore');
var LocaleActions = require('../actions/LocaleActions');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var $ = require('jquery');

var LocaleChooser = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    id: React.PropTypes.string
  },

  getDefaultProps(){
    return {
      id: 'locale-dropdown'
    };
  },


  componentDidMount() {
    $(this.refs.dropdownButton).dropdown({hover: true});
  },

  shouldComponentUpdate(nextProps, nextState){
    if(this.state.locale != nextState.locale){
      return true;
    }
    return false;
  },

  onChange(locale){
    LocaleActions.changeLocale(locale);
    $(this.refs.dropdownMenu).hide();
  },

  render() {

    var _this = this;

    var options = {
      'en':  {label: 'English'},
      'fr': {label: 'Français'},
      'es': {label: 'Español'},
      'it': {label: 'Italiano'}
    };

    return (
      <li className="nav-link-wrapper">
        <a ref="dropdownButton" className="locale-dropdown-button"
          href="#!" data-activates={this.props.id} style={{paddingRight: 0, color: '#29ABE2 !important'}}>{options[this.state.locale].label}
          <i className="material-icons right" style={{marginLeft: 0, color: '#212121 !important'}}>arrow_drop_down</i></a>
          <ul ref="dropdownMenu" id={this.props.id} className="dropdown-content">
            <li><a href="#!" onClick={function(){_this.onChange('en');}} className="nav-hover-menu-item">English</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('fr');}} className="nav-hover-menu-item">Français</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('es');}} className="nav-hover-menu-item">Español</a></li>
            <li><a href="#!" onClick={function(){_this.onChange('it');}} className="nav-hover-menu-item">Italiano</a></li>
          </ul>
      </li>

    );

  }
});

module.exports = LocaleChooser;
