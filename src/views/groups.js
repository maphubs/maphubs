//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCarousel from '../components/CardCarousel/CardCarousel';
var debug = require('../services/debug')('views/groups');
var urlUtil = require('../services/url-util');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
var cardUtil = require('../services/card-util');

import MapHubsComponent from '../components/MapHubsComponent';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';
import LocaleActions from '../actions/LocaleActions';

export default class Groups extends MapHubsComponent {

  props: {
    featuredGroups: Array<Object>,
    recentGroups: Array<Object>,
    popularGroups: Array<Object>,
    locale: string,
    _csrf: string,
    footerConfig: Object
  }

  static defaultProps: {
    groups: []
  }

  state: {
    searchResults: [],
    searchActive: false
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  handleSearch(input: string) {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/groups/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          if(res.body.groups && res.body.groups.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.groups});
            NotificationActions.showNotification({message: res.body.groups.length + ' ' + _this.__('Results'), position: 'bottomleft'});
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
  }

  resetSearch(){
    this.setState({searchActive: false, searchResults: []});
  }

	render() {

    var featuredCards = this.props.featuredGroups.map(cardUtil.getGroupCard);
    var popularCards = this.props.popularGroups.map(cardUtil.getGroupCard);
    var recentCards = this.props.recentGroups.map(cardUtil.getGroupCard);


    var searchResults = '';

    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){

        var searchCards = this.state.searchResults.map(cardUtil.getGroupCard);
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <CardCarousel infinite={false} cards={searchCards}/>
          </div>
          </div>
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
      featured = (
        <div className="row">
          <div className="col s12">
            <h5>{this.__('Featured')}</h5>
            <div className="divider"></div>
            <CardCarousel cards={featuredCards} infinite={false}/>
          </div>
        </div>
      );
    }

		return (
      <div>
          <Header activePage="groups" />
          <main>
            <div style={{marginTop: '20px', marginBottom: '10px'}}>
              <div className="row" style={{marginBottom: '0px'}}>
                <div className="col l8 m7 s12">
                  <p style={{fontSize: '16px', margin: 0}}>{this.__('Layers are managed by groups. Create a group for your organization or browse the layers of existing groups.')}</p>
                </div>
                <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
              <SearchBox label={this.__('Search Groups')} suggestionUrl="/api/groups/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
            </div>
            <div className="carousel-container">

            {searchResults}

              {featured}
              <div className="row">
                <div className="col s12">
                  <h5>{this.__('Popular')}</h5>
                  <div className="divider"></div>
                  <CardCarousel cards={popularCards} infinite={false}/>
                </div>
              </div>
              <div className="row">
                <div className="col s12">
                  <h5>{this.__('Recent')}</h5>
                  <div className="divider"></div>
                  <CardCarousel cards={recentCards} infinite={false}/>
                </div>
              </div>
              <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Group')}>
                <a className="btn-floating btn-large red red-text" href="/creategroup">
                  <i className="large material-icons">add</i>
                </a>
              </div>
            </div>
          </main>
          <Footer {...this.props.footerConfig}/>
      </div>
		);
	}
}