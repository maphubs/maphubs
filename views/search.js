var React = require('react');
var ReactDOM = require('react-dom');
var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var debug = require('../services/debug')('home');
var $ = require('jquery');

var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var slug = require('slug');
var _shuffle = require('lodash.shuffle');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

import Progress from '../components/Progress';

var Search = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      searchResult: null,
      searchCards: [],
      searching: false
    };
  },

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  componentDidMount(){
    var q = this.getParameterByName('q');
    if(q){
      this.handleSearch(q);
    }
  },

  componentDidUpdate(){
    if(this.state.searchResult){
      var scrollTarget = $(ReactDOM.findDOMNode(this.refs.search));
      $('html,body').animate({
         scrollTop: scrollTarget.offset().top
       }, 1000);
    }
  },

  onResetSearch(){
    this.refs.map.resetGeoJSON();
    this.setState({searchResult: null, searchCards: []});
  },

  handleSearch(input){
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
  },

  getLayerCard(layer){
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
    return {
      id: layer.layer_id.toString(),
      title: layer.name,
      description: layer.description,
      image_url,
      source: layer.source,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
    };
  },

  getGroupCard(group){
    var image_url = null;
    if(group.hasimage){
      image_url = '/group/' + group.group_id + '/image';
    }
    return {
      id: group.group_id,
      title: group.name,
      description: group.description,
      image_url,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group'
    };
  },

  getHubCard(hub){
    var title = hub.name.replace('&nbsp;', '');
    var hubUrl = urlUtil.getHubUrl(hub.hub_id, config.host, config.port);
    return {
      id: hub.hub_id,
      title,
      description: hub.description,
      image_url: '/hub/' + hub.hub_id + '/images/logo',
      background_image_url: '/hub/' + hub.hub_id + '/images/banner/thumbnail',
      link: hubUrl,
      type: 'hub'
    };
  },

  getMapCard(map){
    var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.jpg';
    return {
      id: map.map_id.toString(),
      title: map.title ? map.title : '',
      image_url,
      link: '/user/' + map.username + '/map/' + map.map_id,
      type: 'map',
      map
    };
  },

  getStoryCard(story){
    var title = story.title.replace('&nbsp;', '');
    var story_url = '';
    if(story.display_name){
      var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
      story_url = baseUrl + '/user/' + story.display_name;
    }else if(story.hub_id){
      var hubUrl = urlUtil.getHubUrl(story.hub_id, config.host, config.port);
      story_url = hubUrl;
    }
    story_url += '/story/' + story.story_id + '/' + slug(title);

    var image_url = null;
    if(story.firstimage){
      image_url = story.firstimage.replace(/\/image\//i, '/thumbnail/');
    }

    return {
      id: story.story_id.toString(),
      title,
      image_url,
      link: story_url,
      type: 'story',
      story
    };
  },

  getMixedCardSet(layers, groups, hubs, maps, stories){
    return _shuffle(layers.map(this.getLayerCard)
      .concat(groups.map(this.getGroupCard))
      .concat(hubs.map(this.getHubCard))
      .concat(maps.map(this.getMapCard))
      .concat(stories.map(this.getStoryCard))
    );
  },

	render() {
    var cardsPanel = '';
    if(this.state.searchCards && this.state.searchCards.length > 0){
      cardsPanel = (
        <div className="row">
          <div className="col s12">
            <div className="divider"></div>
            <CardCarousel cards={this.state.searchCards} infinite={false}/>
          </div>
        </div>
      );
    }

		return (
      <div>
      <Header />
      <main style={{height: '100%', margin: 0}}>
         <div className="divider"></div>
        <div ref="search" className="container" style={{height: '100px', paddingTop:'10px'}}>
          <div className="row" style={{marginBottom: '10px'}}>
            <h5 className="center-align" style={{color: '#212121', marginTop: '0px'}}>{this.__('Search MapHubs')}</h5>
            </div>
          <div className="row">
            <SearchBox label={this.__('Search All Data')} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
          </div>
        </div>
        <div className="row no-margin" style={{height: 'calc(75% - 150px)', minHeight: '200px'}}>
          <Map ref="map" style={{width: '100%', height: '100%'}}
            disableScrollZoom={true} hoverInteraction={true}
            data={this.state.searchResult} >
            <Legend style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                zIndex: '1',
                width: '160px'
              }}/>
          </Map>
         </div>
         <div className="divider"></div>
         <div className="row no-margin" style={{height: 'calc(50% - 50px)', minHeight: '200px'}}>
           {cardsPanel}
          </div>
          <Progress id="searching" title={this.__('Searching')} subTitle="" dismissible={false} show={this.state.searching}/>
       </main>
       <Footer />
			</div>
		);
	}
});

module.exports = Search;
