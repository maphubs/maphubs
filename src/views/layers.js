//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCollection from '../components/CardCarousel/CardCollection';
var debug = require('../services/debug')('views/layers');
var urlUtil = require('../services/url-util');
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
var cardUtil = require('../services/card-util');
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

import type {Layer} from '../stores/layer-store';

type Props = {
  featuredLayers: Array<Layer>,
  recentLayers: Array<Layer>,
  popularLayers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}
export default class Layers extends MapHubsComponent<void, Props, State> {

  props: Props

  state = {
    searchResults: [],
    searchActive: false
  }

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  handleSearch = (input: string) => {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
    .type('json').accept('json')
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.layers && res.body.layers.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.layers});
            NotificationActions.showNotification({message: res.body.layers.length + ' ' + _this.__('Results'), position: 'bottomleft'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'});
          }
        }
      },
      (cb) => {
        cb();
      }
      );
    });
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []});
  }

	render() {

    var featuredCards = this.props.featuredLayers.map(cardUtil.getLayerCard);
    var recentCards = this.props.recentLayers.map(cardUtil.getLayerCard);
    var popularCards = this.props.popularLayers.map(cardUtil.getLayerCard);

    var searchResults = '';

    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){

        var searchCards = this.state.searchResults.map(cardUtil.getLayerCard);
        searchResults = (
          <CardCollection title={this.__('Search Results')} cards={searchCards} />
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
      featured= (
        <CardCollection title={this.__('Featured')} cards={featuredCards} />
      );
    }


		return (
      <div>
        <Header activePage="layers" {...this.props.headerConfig}/>
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className="row" style={{marginBottom: '0px'}}>
              <div className="col l8 m7 s12">
                <h4 className="no-margin">{this.__('Layers')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{this.__('Browse map layers or create a new layer.')}</p>
              </div>
              <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Layers')} suggestionUrl="/api/layers/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
          </div>
          {searchResults}
          {featured}
          <CardCollection title={this.__('Popular')} cards={popularCards} viewAllLink="/layers/all" />
          <CardCollection title={this.__('Recent')} cards={recentCards} viewAllLink="/layers/all" />
         
          <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Layer')}>
            <a href="/createlayer" className="btn-floating btn-large red red-text">
              <i className="large material-icons">add</i>
            </a>
          </div>
          <div className="row center-align">
            <a className="btn" href="/layers/all">{this.__('View All Layers')}</a>
          </div>
        </main>
        <Footer {...this.props.footerConfig}/>
      </div>
		);
	}
}