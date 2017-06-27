//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCollection from '../components/CardCarousel/CardCollection';
var cardUtil = require('../services/card-util');
var debug = require('../services/debug')('views/maps');
var urlUtil = require('../services/url-util');
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  featuredMaps: Array<Object>,
  recentMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}

export default class Maps extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State = {
    searchResults: [],
    searchActive: false
  }

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  handleSearch = (input: string) => {
    var _this = this;
    debug.log('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
    .type('json').accept('json')
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.maps && res.body.maps.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.maps});
            NotificationActions.showNotification({message: res.body.maps.length + ' ' + _this.__('Results'), position: 'bottomleft'});
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

    var featuredCards = this.props.featuredMaps.map(cardUtil.getMapCard);
    var recentCards = this.props.recentMaps.map(cardUtil.getMapCard);
    var popularCards = this.props.popularMaps.map(cardUtil.getMapCard);


    var searchResults = '';
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){

        var searchCards =   this.state.searchResults.map(cardUtil.getMapCard);

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
    if(!MAPHUBS_CONFIG.mapHubsPro && featuredCards && featuredCards.length > 0){
      featured = (
        <CardCollection title={this.__('Featured')} cards={featuredCards} viewAllLink="/maps/all" />
      );
    }

		return (
      <div>
        <Header activePage="maps" {...this.props.headerConfig}/>
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className="row" style={{marginBottom: '0px'}}>
              <div className="col l8 m7 s12">
                <h4 className="no-margin">{this.__('Maps')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{this.__('Browse maps or create a new map using the respository of open map layers.')}</p>
              </div>
              <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Maps')} suggestionUrl="/api/maps/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
          </div>
          {searchResults}
          {featured}
          <CardCollection title={this.__('Popular')} cards={popularCards} viewAllLink="/maps/all" />
          <CardCollection title={this.__('Recent')} cards={recentCards} viewAllLink="/maps/all" />
          
          <div>
            <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Map')}>
              <a href="/map/new" className="btn-floating btn-large red red-text">
                <i className="large material-icons">add</i>
              </a>
            </div>
          </div>
          <div className="row center-align">
            <a className="btn" href="/maps/all">{this.__('View All Maps')}</a>
          </div>
        </main>
        <Footer {...this.props.footerConfig}/>
      </div>
		);
	}
}