var React = require('react');
var ReactDOM = require('react-dom');
var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var request = require('superagent');
var debug = require('../services/debug')('home');
var $ = require('jquery');

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
    this.setState({searchResult: null});
  },

  handleSearch(input){
    var _this = this;
    this.setState({searching: true});
    request.get('/api/global/search' + '?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      _this.setState({searching: false});
      if (err) {
        debug(err);
        MessageActions.showMessage({title: 'Error', message: err.toString()});
      }else{
        if(res.body && res.body.features && res.body.features.length > 0){
          NotificationActions.showNotification(
            {
              message: res.body.features.length + ' ' + _this.__('Results Found'),
              position: 'bottomright',
              dismissAfter: 3000
          });
          _this.setState({searchResult: res.body});
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
      }
    });
  },

	render() {
    var searchCards = [];
    var cardsPanel = '';
    if(this.state.searchResult){
      cardsPanel = (
        <div className="row">
          <div className="col s12">
            <div className="divider"></div>
            <CardCarousel cards={searchCards} infinite={false}/>
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
        <div className="row no-margin" style={{height: 'calc(100% - 150px)', minHeight: '200px'}}>
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
