var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;
var ConfirmationActions = require('../actions/ConfirmationActions');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var SearchIndexAdmin = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired,
    connectionStatus: React.PropTypes.string.isRequired,
    indexStatus: React.PropTypes.string.isRequired,
  },



  createIndex(){

   var _this = this;
   ConfirmationActions.showConfirmation({
      title: this.__('Confirm'),
      postitiveButtonText: this.__('Confirm'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning!'),
      onPositiveResponse(){
        request.post('/admin/searchindex/create')
        .type('json').accept('json')
        .send({
          _csrf: _this.state._csrf
        })
        .end(function(err, res){
          checkClientError(res, err, function(){}, function(cb){
            if(err){
                MessageActions.showMessage({title: _this.__('Server Error'), message: err});
              }else{
                NotificationActions.showNotification(
                  {
                    message: _this.__('Success'),
                    position: 'topright',
                    dismissAfter: 3000
                });
              }
            cb();
          }, );
        });
      }
    });
   
  },

  rebuildFeatures(){
   var _this = this;
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm'),
      postitiveButtonText: this.__('Confirm'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning this may take a long time, monitor the logs!'),
      onPositiveResponse(){
        request.post('/admin/searchindex/rebuild/features')
        .type('json').accept('json')
        .send({
          _csrf: _this.state._csrf
        })
        .end(function(err, res){
          checkClientError(res, err, function(){}, function(cb){
            if(err){
                MessageActions.showMessage({title: _this.__('Server Error'), message: err});
              }else{
                NotificationActions.showNotification(
                  {
                    message: _this.__('Success'),
                    position: 'topright',
                    dismissAfter: 3000
                });
              }
            cb();
          }, );
        });
      }
    });
  },

  render() {
      return (
        <div>
          <Header />
          <main className="container" style={{height: 'calc(100% - 100px)'}}>
            <div>
            <p><b>{this.__('Connection Status:')}</b> {this.props.connectionStatus}</p>
            </div>
            <div>
              <p><b>{this.__('Index Status:')}</b> {this.props.indexStatus}</p>
            </div>
            <div>
              <button className="btn" onClick={this.createIndex}>{this.__('Create Index')}</button>
            </div>
             <div>
              <button className="btn" onClick={this.rebuildFeatures}>{this.__('Rebuild Feature Index')}</button>
            </div>
          </main>
          <Footer />
        </div>
      );


  }
});

module.exports = SearchIndexAdmin;
