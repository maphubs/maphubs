var React = require('react');

var Header = require('../components/header');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var CreateMap = require('../components/CreateMap/CreateMap');
var CreateMapActions = require('../actions/CreateMapActions');
var debug = require('../services/debug')('usermaps');
//var slug = require('slug');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserMaps = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		maps: React.PropTypes.array,
    user: React.PropTypes.object,
    myMaps: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      maps: [],
      user: {},
      myMaps: false
    };
  },

  handleSearch(input) {
    debug(input);
  },

  showCreateMap(){
      CreateMapActions.showMapDesigner();
  },

  mapCreated(map_id){
    window.location = '/user/' + this.props.user.display_name + '/map/'+map_id;
  },


	render() {
    var _this = this;
    var cards = [];

    _this.props.maps.map(function(map){

      var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.png';

      cards.push({
        id: map.layer_id,
        title: map.title ? map.title : '',
        image_url,
        link: '/user/' + _this.props.user.display_name + '/map/' + map.map_id,
        type: 'map'
      });

    });

  var createMaps = '';
  if(this.props.myMaps){
    createMaps=(
      <div>
        <CreateMap onCreate={this.mapCreated} userMap/>
        <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Map')}>
          <a onClick={this.showCreateMap} className="btn-floating btn-large red">
            <i className="large material-icons">add</i>
          </a>
        </div>
      </div>
    );
  }

  var searchResults = '';
  var searchCards = [];

		return (
      <div>
        <Header />
        <main>
          <div className="container" style={{marginTop: '20px', marginBottom: '20px'}}>
            <SearchBox label={this.__('Search Maps')} suggestionUrl="/api/user/maps/search/suggestions" onSearch={this.handleSearch}/>
          </div>
          <div className="row">
            <div className="col s12">
              {searchResults}
            </div>
          </div>
          <div className="row">
            <div className="col s12">
              <h4>{this.__('My Maps')}</h4>
              <CardCarousel infinite={false} cards={cards} />
            </div>
          </div>
          {createMaps}
        </main>
      </div>
		);
	}
});

module.exports = UserMaps;
