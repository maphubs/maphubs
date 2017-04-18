// @flow
import React from 'react';
import PropTypes from 'prop-types';
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCollection = require('../components/CardCarousel/CardCollection');
var debug = require('../services/debug')('views/hubs');
var urlUtil = require('../services/url-util');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;


var Hubs = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    featuredHubs: PropTypes.array,
    popularHubs: PropTypes.array,
    recentHubs: PropTypes.array,
    allHubs:  PropTypes.array,
    locale: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  },

  getDefaultProps() {
    return {
      featuredHubs: [],
      popularHubs: [],
      recentHubs: [],
      allHubs: []
    };
  },

  handleSearch(input: string) {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/hubs/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.hubs && res.body.hubs.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.hubs});
            NotificationActions.showNotification({message: res.body.hubs.length + ' ' + _this.__('Results'), position: 'bottomleft'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'});
          }
        }
      },
      function(cb){
        cb();
      }
      );
    });
  },

  resetSearch(){
    this.setState({searchActive: false, searchResults: []});
  },

	render() {

    var featuredCards = this.props.featuredHubs.map(cardUtil.getHubCard);
    var recentCards = this.props.recentHubs.map(cardUtil.getHubCard);
    var popularCards = this.props.popularHubs.map(cardUtil.getHubCard);
    var allCards = this.props.allHubs.map(cardUtil.getHubCard);
    
    var searchResults = '';
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){
        var searchCards = this.state.searchResults.map(cardUtil.getHubCard);
        searchResults = (
          <CardCollection cards={searchCards} title={this.__('Search Results')} />
        );
      }
      else {
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <p><b>{this.__('No Results Found')}</b></p>
          </div>
          </div>
        );
      }
    }

    var featured = '';
    if(featuredCards.length > 0){
      featured = (<CardCollection cards={featuredCards} title={this.__('Featured')} />);
    }

    var all = '';
    if(allCards.length > 0){
      all = (<CardCollection cards={allCards} title={this.__('All Hubs')} />);
    }

		return (
      <div>
          <Header activePage="hubs" />
          <main>
            <div style={{marginTop: '20px', marginBottom: '20px'}}>
              <div className="row">
                <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
                  <SearchBox label={this.__('Search Hubs')} suggestionUrl="/api/hubs/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
                </div>
              </div>
            </div>

            {searchResults}
            {featured}
            <CardCollection cards={popularCards} title={this.__('Popular')} />
            <CardCollection cards={recentCards} title={this.__('Recent')} />            
            {all}
            <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Hub')}>
              <a className="btn-floating btn-large red red-text" href="/createhub">
                <i className="large material-icons">add</i>
              </a>
            </div>
          </main>
          <Footer {...this.props.footerConfig}/>
      </div>
		);
	}
});

module.exports = Hubs;
