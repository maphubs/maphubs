import React from 'react';
import PropTypes from 'prop-types';

var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var cardUtil = require('../services/card-util');

//var debug = require('../services/debug')('usermaps');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserMaps = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		maps: PropTypes.array,
    user: PropTypes.object,
    myMaps: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  },

  getDefaultProps() {
    return {
      maps: [],
      user: {},
      myMaps: false
    };
  },

	render() {

  var cards = this.props.maps.map(cardUtil.getMapCard);

  var createMaps = '';
  if(this.props.myMaps){
    createMaps=(
      <div>
        <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Map')}>
          <a href="/map/new" className="btn-floating btn-large red red-text">
            <i className="large material-icons">add</i>
          </a>
        </div>
      </div>
    );
  }

  var myMaps = '';
  if(!this.props.maps || this.props.maps.length == 0){
    myMaps = (
      <div className="row" style={{height: 'calc(100% - 100px)'}}>
        <div className="valign-wrapper" style={{height: '100%'}}>
          <div className="valign align-center center-align" style={{width: '100%'}}>
            <h5>{this.__('Click the button below to create your first map')}</h5>
          </div>
        </div>
      </div>
    );
  }else{
    myMaps = (
      <div className="row">
        <div className="col s12">
          <h4>{this.__('My Maps')}</h4>
          <CardCarousel infinite={false} cards={cards} />
        </div>
      </div>
    );
  }

		return (
      <div>
        <Header/>
        <main style={{height: 'calc(100% - 70px)'}}>
          {myMaps}
          {createMaps}
        </main>
        <Footer {...this.props.footerConfig} />
      </div>
		);
	}
});

module.exports = UserMaps;
