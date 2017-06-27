//@flow
import React from 'react';
import SearchBox from '../SearchBox';
import CardCarousel from '../CardCarousel/CardCarousel';
var cardUtil = require('../../services/card-util');
var debug = require('../../services/debug')('mapmaker/addlayerpanel');
var urlUtil = require('../../services/url-util');
import request from 'superagent';
var checkClientError = require('../../services/client-error-response').checkClientError;
import MessageActions from '../../actions/MessageActions';
import NotificationActions from '../../actions/NotificationActions';
import MapHubsComponent from '../MapHubsComponent';

type Props = {
  myLayers: Array<Object>,
  popularLayers: Array<Object>,
  onAdd: Function
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}

export default class AddLayerPanel extends MapHubsComponent<void, Props, State> {

  props:  Props

  state = {
    searchResults: [],
    searchActive: false
  }

  handleSearch = (input: string) => {
    var _this = this;
    debug.log('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
    .type('json').accept('json')
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.layers && res.body.layers.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.layers});
            NotificationActions.showNotification({message: res.body.layers.length + ' ' + _this.__('Results'), position: 'topright'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'topright'});
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

  render(){
    var _this = this;
    var myCards = [];
    var popularCards = [];
    var myLayers = '';

    var cardCarouselStops = [
      {breakpoint: 600, settings: {slidesToShow: 1,  slidesToScroll: 1}},
      {breakpoint: 950, settings: {slidesToShow: 2,  slidesToScroll: 2}},
      {breakpoint: 1150, settings: {slidesToShow: 3,  slidesToScroll: 3}},
      {breakpoint: 1400, settings: {slidesToShow: 4,  slidesToScroll: 4}},
      {breakpoint: 1700, settings: {slidesToShow: 5,  slidesToScroll: 5}},
       {breakpoint: 2500, settings: {slidesToShow: 6,  slidesToScroll: 6}},
       {breakpoint: 4000, settings: {slidesToShow: 8,  slidesToScroll: 8}}
   ];

    if(this.props.myLayers && this.props.myLayers.length > 0){
      myCards = this.props.myLayers.map((layer, i) => {
        return cardUtil.getLayerCard(layer, i, [], _this.props.onAdd);
      });
      myLayers = (
        <div className="row">
          <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('My Layers')}</h5>
            <div className="divider"></div>
            <CardCarousel cards={myCards} infinite={false} responsive={cardCarouselStops} showAddButton/>
          </div>
        </div>
      );
    }

    popularCards = this.props.popularLayers.map((layer, i) => {
      return cardUtil.getLayerCard(layer, i, [], _this.props.onAdd);
    });

    var searchResults = '';
    var searchCards = [];
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){


        searchCards = this.state.searchResults.map((layer, i) => {
          return cardUtil.getLayerCard(layer, i, [], _this.props.onAdd);
        });
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <CardCarousel infinite={false} cards={searchCards} responsive={cardCarouselStops} showAddButton/>
          </div>
          </div>
        );
      }
      else {
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <p><b>{this.__('No Results Found')}</b></p>
          </div>
          </div>
        );
      }
    }

    return (
      <div style={{paddingTop: '10px'}}>
        <div style={{paddingLeft: '25%', paddingRight: '25%'}}>
          <SearchBox label={this.__('Search Layers')} suggestionUrl="/api/layers/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
        </div>
        <div>
            {searchResults}
            {myLayers}
            <div className="row">
              <div className="col s12">
                <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Popular Layers')}</h5>
                <div className="divider"></div>
                <CardCarousel cards={popularCards} infinite={false} responsive={cardCarouselStops} showAddButton/>
              </div>
            </div>
          </div>
      </div>
    );
  }
}