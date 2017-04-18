import React from 'react';
import PropTypes from 'prop-types';

var Header = require('../components/header');
var Footer = require('../components/footer');
var CodeEditor = require('../components/LayerDesigner/CodeEditor');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var PageEdit = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: PropTypes.string.isRequired,
    page_id: PropTypes.string.isRequired,
    pageConfig: PropTypes.object.isRequired,
    footerConfig: PropTypes.object
  },

  getInitialState(){
    return {
      pageConfig: this.props.pageConfig
    };
  },

  componentDidMount(){
    this.refs.pageEditor.show();
  },

  savePageConfig(pageConfig){
   var _this = this;
   request.post('/api/page/save')
   .type('json').accept('json')
   .send({
     page_id: this.props.page_id,
     pageConfig,
     _csrf: this.state._csrf
   })
   .end(function(err, res){
     checkClientError(res, err, function(){}, function(cb){
       _this.setState({pageConfig: JSON.parse(pageConfig)});
       if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification(
            {
              message: _this.__('Page Saved'),
              position: 'topright',
              dismissAfter: 3000
          });
        }
       cb();
     }, );
   });
  },

  render() {
      return (
        <div>
          <Header />
          <main className="container" style={{height: 'calc(100% - 100px)'}}>
            <CodeEditor ref="pageEditor" id="layer-style-editor" mode="json"
                        code={JSON.stringify(this.state.pageConfig, undefined, 2)} 
                        title={this.__('Editing Page Config: ') + this.props.page_id}
                        onSave={this.savePageConfig} modal={false}/>
          </main>
          <Footer {...this.props.footerConfig}/>
        </div>
      );


  }
});

module.exports = PageEdit;
