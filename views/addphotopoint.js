var React = require('react');

var Header = require('../components/header');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');


var AddPhotoPoint = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		layer: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      
    };
  },

  showPhotoCrop(){

  },

  setPhoto(){

  },

  savePhoto(){

  },

  render(){

    //check if layer is a point layer
    if(this.props.layer.data_type !== 'point'){
      return (
        <div>
          <Header />
          <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
            <b>{this.__('This feature is not supported for this layer')}</b>
          </main>
        </div>
      );
    }

    var map = '';


    return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <h5>{this.props.layer.name}</h5>
          <p>{this.__('Upload a Photo with Location Information')}</p>

        </main>
      </div>
    );
  }
});

module.exports = AddPhotoPoint;
