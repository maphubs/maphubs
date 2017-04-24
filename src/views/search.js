//@flow
import React from 'react';
import Map from '../components/Map/Map';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCollection from '../components/CardCarousel/CardCollection';
var cardUtil = require('../services/card-util');
import Promise from 'bluebird';
import request from 'superagent-bluebird-promise';
var debug = require('../services/debug')('home');
var $ = require('jquery');
import _shuffle from 'lodash.shuffle';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import Progress from '../components/Progress';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Search extends MapHubsComponent {


  props: {
    locale: string,
    footerConfig: Object,
    _csrf: string
  }

  state = {
    searchResult: null,
    searchCards: [],
    searching: false
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  getParameterByName = (name: string, url: any) => {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  componentDidMount(){
    var q = this.getParameterByName('q');
    if(q){
      this.handleSearch(q);
    }
  }

  componentDidUpdate(){
    if(this.state.searchResult){
      var scrollTarget = $(this.refs.search);
      $('html,body').animate({
         scrollTop: scrollTarget.offset().top
       }, 1000);
    }
  }

  onResetSearch = () =>{
    this.refs.map.resetGeoJSON();
    this.setState({searchResult: null, searchCards: []});
  }

  handleSearch = (input: string) => {
    var _this = this;
    this.setState({searching: true});
    var requests = [
      request.get('/api/global/search' + '?q=' + input).type('json').accept('json').promise(),
      request.get('/api/layers/search' + '?q=' + input).type('json').accept('json').promise(),
      request.get('/api/groups/search' + '?q=' + input).type('json').accept('json').promise(),
      request.get('/api/hubs/search' + '?q=' + input).type('json').accept('json').promise(),
      request.get('/api/maps/search' + '?q=' + input).type('json').accept('json').promise()
    ];

    Promise.all(requests).then(function(results){
      _this.setState({searching: false});

      var totalResults = 0;

      var featureRes = results[0];
      var layerRes = results[1];
      var groupRes = results[2];
      var hubRes = results[3];
      var mapRes = results[4];

      var layerResults =[];
      var groupResults = [];
      var hubResults = [];
      var mapResults = [];
      var storyResults = [];

      //layers
      if(layerRes.body && layerRes.body.layers && layerRes.body.layers.length > 0){
        totalResults += layerRes.body.layers.length;
        layerResults = layerRes.body.layers;
      }

      //groups
      if(groupRes.body && groupRes.body.groups && groupRes.body.groups.length > 0){
        totalResults += groupRes.body.groups.length;
        groupResults = groupRes.body.groups;
      }

      //hubs
      if(hubRes.body && hubRes.body.hubs && hubRes.body.hubs.length > 0){
        totalResults += hubRes.body.hubs.length;
        hubResults = hubRes.body.hubs;
      }

      //map
      if(mapRes.body && mapRes.body.maps && mapRes.body.maps.length > 0){
        totalResults += mapRes.body.maps.length;
        mapResults = mapRes.body.maps;
      }

      var searchCards = _this.getMixedCardSet(layerResults, groupResults, hubResults, mapResults, storyResults);

      //features
      if(featureRes.body && featureRes.body.features && featureRes.body.features.length > 0){
        _this.setState({
          searchResult: featureRes.body,
          searchCards
        });
        totalResults += featureRes.body.features.length;
      }else{
        _this.setState({
          searchCards
        });
      }

      if(totalResults > 0){
        NotificationActions.showNotification(
          {
            message: totalResults
             + ' ' + _this.__('Results Found'),
            position: 'bottomright',
            dismissAfter: 3000
        });

      }else{
        //clear Map
        //tell user no results found
        NotificationActions.showNotification(
          {
            message: _this.__('No Results Found'),
            position: 'bottomright',
            dismissAfter: 3000
        });
      }



    }).catch(function(err){
      _this.setState({searching: false});
      debug(err);
      MessageActions.showMessage({title: 'Error', message: err.toString()});

    });
  }

  getMixedCardSet(layers: Array<Object>, groups: Array<Object>, hubs: Array<Object>, maps: Array<Object>, stories: Array<Object>){
    return _shuffle(layers.map(cardUtil.getLayerCard)
      .concat(groups.map(cardUtil.getGroupCard))
      .concat(hubs.map(cardUtil.getHubCard))
      .concat(maps.map(cardUtil.getMapCard))
      .concat(stories.map(cardUtil.getStoryCard))
    );
  }

	render() {
    var cardsPanel = '';
    if(this.state.searchCards && this.state.searchCards.length > 0){
      cardsPanel = (
        <CardCollection cards={this.state.searchCards} />
      );
    }

		return (
      <div>
      <Header />
      <main style={{margin: 0}}>
        <div ref="search" className="container" style={{height: '55px', paddingTop:'10px'}}>
          <div className="row no-margin">
            <SearchBox label={this.__('Search') + ' ' + MAPHUBS_CONFIG.productName} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
          </div>
        </div>
        <div className="row no-margin" style={{height: 'calc(75vh - 55px)', minHeight: '200px'}}>
          <Map ref="map" style={{width: '100%', height: '100%'}}
            disableScrollZoom={true} hoverInteraction={false} showLogo={false} attributionControl={true}
            data={this.state.searchResult} >
          </Map>
         </div>
         <div className="divider"></div>
         <div className="row no-margin" style={{height: 'calc(50% - 50px)', minHeight: '200px'}}>
           {cardsPanel}
          </div>
          <Progress id="searching" title={this.__('Searching')} subTitle="" dismissible={false} show={this.state.searching}/>
       </main>
       <Footer {...this.props.footerConfig}/>
			</div>
		);
	}
}