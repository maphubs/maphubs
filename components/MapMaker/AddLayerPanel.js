var React = require('react');

var SearchBox = require('../SearchBox');
var MapMakerCardCarousel = require('./MapMakerCardCarousel.js');
var debug = require('../../services/debug')('mapmaker/addlayerpanel');

var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var request = require('superagent');
var checkClientError = require('../../services/client-error-response').checkClientError;
var MessageActions = require('../../actions/MessageActions');
var NotificationActions = require('../../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var AddLayerPanel = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    myLayers: React.PropTypes.array,
    popularLayers: React.PropTypes.array,
    onAdd: React.PropTypes.func.isRequired
  },

  getInitialState(){
    return {
      searchResults: [],
      searchActive: false
    };
  },

  handleSearch(input) {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl(config.host, config.port) + '/api/layers/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
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
      function(cb){
        cb();
      }
      );
    });
  },

  resetSearch(){
    this.setState({searchActive: false, searchResults: []});
  },

  render(){
    var _this = this;
    var myCards = [];
    var popularCards = [];
    var myLayers = '';
    if(this.props.myLayers && this.props.myLayers.length > 0){
      this.props.myLayers.map(function(layer){
        myCards.push({
          layer,
          onClick: _this.props.onAdd
        });
      });
      myLayers = (
        <div className="row">
          <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('My Layers')}</h5>
            <div className="divider"></div>
            <MapMakerCardCarousel cards={myCards} infinite={false}/>
          </div>
        </div>
      );
    }

    this.props.popularLayers.map(function(layer){
      popularCards.push({
        layer,
        onClick: _this.props.onAdd
      });
    });

    var searchResults = '';
    var searchCards = [];
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){


        this.state.searchResults.map(function(layer){
          searchCards.push({
            layer,
            onClick: _this.props.onAdd
          });
        });
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <MapMakerCardCarousel infinite={false} cards={searchCards}/>
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
                <MapMakerCardCarousel cards={popularCards} infinite={false}/>
              </div>
            </div>
          </div>
      </div>
    );

  }


});

module.exports = AddLayerPanel;
