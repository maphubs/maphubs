var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
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

      var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.jpg';

      cards.push({
        id: map.map_id,
        title: map.title ? map.title : '',
        image_url,
        link: '/user/' + _this.props.user.display_name + '/map/' + map.map_id,
        type: 'map',
        map
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

  var myMaps = '';
  if(!this.props.maps || this.props.maps.length == 0){
    myMaps = (
      <div className="row" style={{height: 'calc(100% - 100px)'}}>
        <div className="valign-wrapper" style={{height: '100%'}}>
          <div className="valign align-center center-align" style={{width: '100%'}}>
            <h5>{this.__('Click the button below to create your first map')}</h5>
          </div>
        </div>
      </div>
    );
  }else{
    myMaps = (
      <div className="row">
        <div className="col s12">
          <h4>{this.__('My Maps')}</h4>
          <CardCarousel infinite={false} cards={cards} />
        </div>
      </div>
    );
  }


		return (
      <div>
        <Header activePage="mymaps"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          {myMaps}
          {createMaps}
        </main>
        <Footer />
      </div>
		);
	}
});

module.exports = UserMaps;
