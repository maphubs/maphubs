//@flow
import Reflux from 'reflux';
import Actions from '../actions/ConfirmationActions';
var debug = require('../services/debug')('stores/confirmation-store');
var $ = require('jquery');
import LocaleActions from '../actions/LocaleActions';
var Locales = require('../services/locales');

export default class ConfirmationStore extends Reflux.Store {
 
  constructor(){
    super();
    this.state = this.getEmptyState();
    this.listenables = Actions;
    this.listenTo(LocaleActions.changeLocale,this.updateLocale);
  }

  __(text: string){
    var locale = 'en';
    if(this.state && this.state.locale){
      locale = this.state.locale;
    }
    return Locales.getLocaleString(locale, text);
  }

  getEmptyState(){
    return  {
      show: false,
      locale: 'en',
      title: this.__('Confirmation'),
      message: this.__('Please confirm'),
      postitiveButtonText: this.__('Okay'),
      negativeButtonText: this.__('Cancel'),
      onPositiveResponse() {},
      onNegativeResponse() {}
    };
  }

  reset(){
    this.setState(this.getEmptyState());
  }

  updateLocale(locale: string){
    this.setState({locale});
  }

  storeDidUpdate() {
    debug('store updated');
  }

  //listeners
  showConfirmation(options: Object) {
    if (options) {
      var updatedState = $.extend(this.getEmptyState(), options);
      this.setState(updatedState);
      this.setState({
        show: true
      });
    }
  }
}
