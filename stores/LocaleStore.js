var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/LocaleActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/local-store');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,


  getInitialState() {
    return  {
      locale: 'en'
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners

 changeLocale(locale){
   var _this = this;
   //tell the server so the preference can be saved in the user session
   //this allows the react isomorphic rendering to render the correct langauge on the server
   request.post('/api/user/setlocale')
   .type('json').accept('json')
   .send({
     locale
   })
   .end(function(err, res){
     checkClientError(res, err, function(err){
       if(err){
         debug(err);
       }else{
         debug('changed locale to: ' + locale);
         _this.setState({locale});
         _this.trigger(_this.state);
       }
     },
     function(cb){
       cb();
     }
     );
   });
 }

});
