//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import CodeEditor from '../components/LayerDesigner/CodeEditor';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class PageEdit extends MapHubsComponent {

  props: {
    locale: string,
    page_id: string,
    pageConfig: Object,
    footerConfig: Object
  }

  state: {
    pageConfig: Object
  }

  constructor(props: Object){
    super(props);
    this.state = {
      pageConfig: props.pageConfig
    };
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  componentDidMount(){
    this.refs.pageEditor.show();
  }

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
  }

  render() {
      return (
        <div>
          <Header />
          <main className="container" style={{height: 'calc(100% - 100px)'}}>
            <CodeEditor ref="pageEditor" id="layer-style-editor" mode="json"
                        code={JSON.stringify(this.state.pageConfig, undefined, 2)} 
                        title={this.__('Editing Page Config: ') + this.props.page_id}
                        onSave={this.savePageConfig.bind(this)} modal={false}/>
          </main>
          <Footer {...this.props.footerConfig}/>
        </div>
      );

  }
}