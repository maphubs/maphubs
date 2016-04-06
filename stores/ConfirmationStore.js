var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/ConfirmationActions');
var debug = require('../services/debug')('stores/confirmation-store');
var $ = require('jquery');
var LocaleStore = require('./LocaleStore');
var Locales = require('../services/locales');

module.exports = Reflux.createStore({
  mixins: [StateMixin, Reflux.ListenerMixin],
  listenables: Actions,

  __(text){
    var locale = 'en';
    if(this.state && this.state.locale){
      locale = this.state.locale;
    }
    return Locales.getLocaleString(locale, text);
  },

  getInitialState() {
    this.listenTo(LocaleStore.locale,this.updateLocale);
    return this.getEmptyState();
  },

  getEmptyState(){
    return  {
      show: false,
      locale: LocaleStore.state.locale,
      title: this.__('Confirmation'),
      message: this.__('Please confirm'),
      postitiveButtonText: this.__('Okay'),
      negativeButtonText: this.__('Cancel'),
      onPositiveResponse() {},
      onNegativeResponse() {}
    };
  },

  reset(){
    this.setState(this.getEmptyState());
  },

  updateLocale(locale){
    this.setState({locale});
  },

  storeDidUpdate() {
    debug('store updated');
  },

  //listeners
  showConfirmation(options) {
    if (options) {
      var updatedState = $.extend(this.getInitialState(), options);
      this.setState(updatedState);
      this.setState({
        show: true
      });
    }
  }

});
