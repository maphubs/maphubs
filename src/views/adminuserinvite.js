// @flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../components/forms/textInput';
import Header from '../components/header';
import Footer from '../components/footer';
import EditList from '../components/EditList';
import ConfirmationActions from '../actions/ConfirmationActions';
import NotificationActions from '../actions/NotificationActions';
import Progress from '../components/Progress';
import MessageActions from '../actions/MessageActions';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';
import ErrorBoundary from '../components/ErrorBoundary';

type User = {
  email: string,
  key: string,
  used: boolean
}

type Props = {
  locale: string,
  _csrf: string,
  members: Array<User>,
  footerConfig: Object,
  headerConfig: Object
}

type State = {
  canSubmit: boolean,
  saving: boolean,
  members: Array<User>
} & LocaleStoreState

export default class AdminUserInvite extends MapHubsComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state = {
      members: this.props.members,
      canSubmit: false,
      saving: false
    };
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

  onSubmit = (user: User) => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Invite'),
      postitiveButtonText: this.__('Send Invite'),
      negativeButtonText: this.__('Cancel'),
      message: this.__(`Are you sure you want to invite ${user.email}?`),
      onPositiveResponse(){
        _this.submitInvite(user); 
      }
    });
  }

  submitInvite = (user: User) => {
    var _this = this;
    this.setState({saving: true});
    request.post('/admin/invite/send')
    .type('json').accept('json')
    .send({email: user.email, _csrf: this.state._csrf})
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        const key = res.body.key;
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
                _this.state.members.push({email: user.email, key, used: false});
               _this.setState({members: _this.state.members});
              }
          });
        }
      },
      (cb) => {
        cb();
      });
    });
  }

  handleResendInvite = (action: {key: string}) => {
    var _this = this;
    this.state.members.forEach((user: User)=>{
      if(user.key === action.key){
        ConfirmationActions.showConfirmation({
          title: this.__('Confirm Resend Email'),
          postitiveButtonText: this.__('Send Invite'),
          negativeButtonText: this.__('Cancel'),
          message: this.__(`Are you sure you want to resend the invite email for ${user.email}?`),
          onPositiveResponse(){
            _this.submitInvite(user); 
          }
        });
      }
    });
  }

  handleDeauthorize = (action: {key: string}) => {
    var _this = this;
    this.state.members.forEach((user)=>{
      if(user.key === action.key){
        ConfirmationActions.showConfirmation({
          title: this.__('Confirm Deauthorize'),
          postitiveButtonText: this.__('Deauthorize'),
          negativeButtonText: this.__('Cancel'),
          message: this.__(`Are you sure you want to deauthorize access for ${user.email}?`),
          onPositiveResponse(){
            _this.submitDeauthorize(user);
          }
        });
      }
    });
  }

  submitDeauthorize = (user: User) => {
    var _this = this;
    this.setState({saving: true});
    request.post('/admin/invite/deauthorize')
    .type('json').accept('json')
    .send({
      email: user.email,
      key: user.key,
      _csrf: this.state._csrf
    })
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        _this.setState({saving: false});
        if(err){
          MessageActions.showMessage({title: _this.__('Failed to Send Invite'), message: err});
        }else {
          NotificationActions.showNotification(
            {
              message: _this.__('User Removed'),
              position: 'topright',
              dismissAfter: 3000,
              onDismiss() {
                let members = [];
               _this.state.members.forEach((member)=>{
                if(member.key !== user.key){
                  members.push(member);
                }
               });
               _this.setState({members});
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
    var _this = this;
    let membersList = [];
    this.state.members.forEach((user) => {
      membersList.push({
        key: user.key,
        label: `${user.email} (${user.key})`,
        icon: user.used ? 'done' : 'email',
        actionIcon: 'email',
        actionLabel: _this.__('Resend Invite')
      });
    });

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig}/>
        <main className="container">
        <h4 className="center">{this.__('Manage Users')}</h4> 
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
                <Formsy onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
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

                </Formsy>
            </div>
            
          </div>
          <div className="row">
            <EditList title="Members" items={membersList} onDelete={this.handleDeauthorize} onAction={this.handleResendInvite} onError={this.onError} />
          </div>
          <Progress id="saving-user-invite" title={this.__('Sending')} subTitle="" dismissible={false} show={this.state.saving}/>
      </main>
      <Footer {...this.props.footerConfig}/>
      </ErrorBoundary>
    );
  }
}