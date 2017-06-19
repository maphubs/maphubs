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
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';

type Props = {
  locale: string,
  page_id: string,
  pageConfig: Object,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string
}

type State = {
  pageConfig?: Object
} & LocaleStoreState

export default class PageEdit extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State

  constructor(props: Props){
    super(props);
     Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state = {
      pageConfig: props.pageConfig
    };
  }

  componentDidMount(){
    this.refs.pageEditor.show();
  }

  savePageConfig = (pageConfig: string) => {
   var _this = this;
   request.post('/api/page/save')
   .type('json').accept('json')
   .send({
     page_id: this.props.page_id,
     pageConfig,
     _csrf: this.state._csrf
   })
   .end((err, res) => {
     checkClientError(res, err, () => {}, (cb) => {
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
          <Header {...this.props.headerConfig}/>
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
}