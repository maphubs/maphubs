//@flow
import React from 'react';

import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import UserActions from '../../actions/UserActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import _isequal from 'lodash.isequal';
import MapHubsComponent from '../MapHubsComponent';

import type {LocaleStoreState} from '../../stores/LocaleStore';

type Props = {
  text: LocalizedString
}

type State = {
  valid: boolean,
  placeholder?: string,
  email: string
} & LocaleStoreState

export default class MailingList extends MapHubsComponent<Props, Props, State> {

  state: State = {
    valid: false,
    email: ''
  }

  static defaultProps: Props = {
    text: {en:'', fr: '', es: '', it: ''}
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes

    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  onValid = () => {
    this.setState({
      valid: true
    });
  }

  onInvalid = () => {
    this.setState({
      valid: false
    });
  }

  onSubmit = (model: Object) => {
    var _this = this;
    if(this.state.valid){
      UserActions.joinMailingList(model.email, this.state._csrf, (err) => {
        if(err){
          MessageActions.showMessage({title: err.title, message: err.detail});
        }else {
          _this.setState({email: _this.state.email, placeholder: _this.__('Thanks for signing up!')});
          NotificationActions.showNotification(
            {
              message: _this.__('Added ' + model.email +' to the list. Thanks for joining!'),
              position: 'topright'
          });
        }
      });
    }else{
      NotificationActions.showNotification(
        {
          message: _this.__('Please enter a valid email address'),
          position: 'topright'
      });
    }
  }

render(){
  var _this = this;

  var placeholder = this.state.placeholder ? this.state.placeholder : _this.__('Sign up for our mailing list');
  return (
    <div className="container valign-wrapper" style={{height: '62px'}}>
      <div className="col s6 valign right-align">
        <b style={{fontSize: '14px'}}>{this._o_(this.props.text)}</b>
      </div>
      <div className="col s6 valign">
      <Formsy.Form onSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInvalid}>
        <div>
            <TextInput name="email" label={null} placeholder={placeholder}
              className="left no-margin no-padding mailing-list-text-input"
                  validations={{isEmail:true}} validationErrors={{
                   isEmail: this.__('Not a valid email address.')
               }}
               showCharCount={false}
               useMaterialize={false}
               value={this.state.email}
               onClick={function(){
                 _this.setState({placeholder: _this.__('Enter your email address')});
               }}
               required/>
             <button type="submit" className="left waves-effect waves-light btn"
              style={{
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '25px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '25px',
                boxShadow:'none',
                height: '40px',
                width: '25%',
                paddingLeft: 0,
                paddingRight: 0,
                textTransform: 'none'
              }}>{this.__('Sign up')}</button>
          </div>
      </Formsy.Form>
       </div>
      </div>
  );
}
}