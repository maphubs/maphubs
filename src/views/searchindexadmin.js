//@flow
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../components/header';
import Footer from '../components/footer';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import ConfirmationActions from '../actions/ConfirmationActions';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class SearchIndexAdmin extends MapHubsComponent {

  props: {
    locale: PropTypes.string.isRequired,
    connectionStatus: PropTypes.string.isRequired,
    indexStatus: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

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
  }

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
  }

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
              <button className="btn" onClick={this.createIndex.bind(this)}>{this.__('Create Index')}</button>
            </div>
             <div>
              <button className="btn" onClick={this.rebuildFeatures.bind(this)}>{this.__('Rebuild Feature Index')}</button>
            </div>
          </main>
          <Footer {...this.props.footerConfig}/>
        </div>
      );
  }
}