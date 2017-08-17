// @flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../components/forms/textInput';
import Header from '../components/header';
import Footer from '../components/footer';
import NotificationActions from '../actions/NotificationActions';
import Progress from '../components/Progress';
import MessageActions from '../actions/MessageActions';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';

type Props = {
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

type AdminUserInviteState = {
  canSubmit: boolean,
  saving: boolean
}

type State = LocaleStoreState & AdminUserInviteState

export default class AdminUserInvite extends MapHubsComponent<Props, State> {

  props: Props

  state: State = {
    canSubmit: false,
    saving: false
  }

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    });
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    });
  }

  onSubmit = (model: Object) => {
    var _this = this;
    this.setState({saving: true});
    request.post('/admin/invite/send')
    .type('json').accept('json')
    .send({email: model.email, _csrf: this.state._csrf})
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        _this.setState({saving: false});
        if(err){
          MessageActions.showMessage({title: _this.__('Failed to Send Invite'), message: err});
        }else {
          NotificationActions.showNotification(
            {
              message: _this.__('Invite Sent'),
              position: 'topright',
              dismissAfter: 3000,
              onDismiss() {
                window.location='/';
              }
          });
        }
      },
      (cb) => {
        cb();
      });
    });
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
                <Formsy.Form onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
                  <div className="row" style={{margin: '25px'}}>
                    <TextInput name="email" label={this.__('Email to Invite')} icon="email" className="col s12"
                          validations={{isEmail:true}} validationErrors={{
                           isEmail: this.__('Not a valid email address.')
                       }} length={50}
                       required/>

                  </div>
                  <div className="row">
                    <div className="col s12 valign-wrapper">
                          <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} disabled={!this.state.canSubmit}>{this.__('Send Invite')}</button>
                    </div>
                  </div>

                </Formsy.Form>
            </div>
          </div>
          <Progress id="saving-user-invite" title={this.__('Sending')} subTitle="" dismissible={false} show={this.state.saving}/>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}