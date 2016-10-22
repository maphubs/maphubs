var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
//var debug = require('../services/debug')('usermaps');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserGroups = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		groups: React.PropTypes.array,
    user: React.PropTypes.object,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      groups: [],
      user: {},
      canEdit: false
    };
  },

	render() {

    var addButton = '', message='';
    if(this.props.canEdit){
      addButton=(
        <div>
          <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Group')}>
            <a href="/creategroup" className="btn-floating btn-large red red-text">
              <i className="large material-icons">add</i>
            </a>
          </div>
        </div>
      );

      message = (
        <h4>{this.__('My Groups')}</h4>
      );
    }else{
      message = (
        <h4>{this.__('Groups for user: ' + this.props.user.display_name)}</h4>
      );
    }

    var groups = '';
    if(this.props.groups && this.props.groups.length > 0){
      var cards = this.props.groups.map(cardUtil.getGroupCard);
      groups = (
        <div className="row">
          <div className="col s12 no-padding">
            <CardCarousel infinite={false} cards={cards} />
          </div>
        </div>
      );
    }else{
    groups = (
      <div className="row" style={{height: 'calc(100% - 100px)'}}>
        <div className="valign-wrapper" style={{height: '100%'}}>
          <div className="valign align-center center-align" style={{width: '100%'}}>
            <h5>{this.__('Click the button below to create your first group')}</h5>
          </div>
        </div>
      </div>
    );
  }
		return (
      <div>
        <Header/>
        <main style={{marginLeft: '10px', marginRight:'10px'}}>
          {message}
          {groups}
          {addButton}
        </main>
        <Footer />
      </div>
		);
	}
});

module.exports = UserGroups;
