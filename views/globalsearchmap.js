var React = require('react');

var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var request = require('superagent');
var debug = require('../services/debug')('globalsearchmap');

var OnboardingLinks = require('../components/Home/OnboardingLinks');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

import Progress from '../components/Progress';

var GlobalMap = React.createClass({

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
  componentDidUpdate(){
    //window.dispatchEvent(new Event('resize'));
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
    var cardsPanel = '', mapPanel = '';
    if(this.state.searchResult){
      cardsPanel = (
      <div style={{margin: '10px'}}>
        <h5>{this.__('Search Results')}</h5>
      </div>
    );

    mapPanel = (
      <div className="row no-margin" style={{height: 'calc(75% - 50px)', minHeight: '200px'}}>
        <Map ref="map" style={{width: '100%', height: '100%'}} data={this.state.searchResult} >
          <Legend style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              zIndex: '1',
              width: '160px'
            }}/>
        </Map>
       </div>
    );

    }else {
      cardsPanel = (
        <div style={{margin: '10px'}}>
          <h5>{this.__('Featured Content')}</h5>
        </div>
      );
    }

		return (
      <div>
      <Header />
      <main style={{height: '100%'}}>
        <OnboardingLinks />
         <div className="divider"></div>
        <div className="container" style={{marginTop: '50px', marginBottom: '50px'}}>
          <div className="row">
            <h5 className="center-align" style={{color: '#212121'}}>{this.__('Search MapHubs')}</h5>
            </div>
          <div className="row">
            <SearchBox label={this.__('Search All Data')} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
          </div>

        </div>
         {mapPanel}
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

module.exports = GlobalMap;
