import React from 'react';
import PropTypes from 'prop-types';

var Header = require('../components/header');

var Formsy = require('formsy-react');
var $ = require('jquery');
var TextInput = require('../components/forms/textInput');
var SelectGroup = require('../components/Groups/SelectGroup');
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

import Progress from '../components/Progress';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var HubActions = require('../actions/HubActions');

var urlUtil = require('../services/url-util');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');


var HubBuilder = React.createClass({

  mixins:[StateMixin.connect(HubStore, 'hub'), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

   propTypes: {
     onSubmit: PropTypes.func,
     active: PropTypes.bool.isRequired,
     groups: PropTypes.array,
     locale: PropTypes.string.isRequired
   },

   getDefaultProps() {
     return {
       onSubmit: null,
       active: false
     };
   },

   getInitialState() {
     return {
       canSubmit: false,
       showError: false,
       errorMessage: '',
       errorTitle: ''
     };
   },

   checkHubIdAvailable(id){
     var result = false;
     var _this = this;
     //only check if a valid value was provided and we are running in the browser
     if (id && typeof window !== 'undefined') {
         $.ajax({
          type: "POST",
          url: '/api/hub/checkidavailable',
          contentType : 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({id, _csrf: this.state._csrf}),
           async: false,
           success(msg){
             if(msg.available){
               result = true;
             }
           },
           error(msg){
             MessageActions.showMessage({title: _this.__('Server Error'), message: msg});
           },
           complete(){
           }
       });
     }
     return result;

     },

   componentWillMount() {
     var _this = this;
     Formsy.addValidationRule('isAvailable', function (values, value) {
         if(_this.state.hub.created) return true;
         if(!this.hubIdValue || value !== this.hubIdValue){
           this.hubIdValue = value;
           this.hubIdAvailable = _this.checkHubIdAvailable(value);

         }
         return this.hubIdAvailable;

     });
   },

   componentDidMount() {

   },

   enableButton () {
       this.setState({
         canSubmit: true
       });
     },
     disableButton () {
       this.setState({
         canSubmit: false
       });
     },

     submit (model) {
       this.saveHub(model);
     },


     saveHub(model){
      var _this = this;
      this.setState({canSubmit: false, saving:true}); //disable submit button

      if(!model.group && this.props.groups.length == 1){
        //creating a new layer when user is only the member of a single group (not showing the group dropdown)
        model.group = this.props.groups[0].group_id;
      }
      
      HubActions.createHub(model.hub_id, model.group, model.name, false, model.private, this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification(
            {
              message: _this.__('Hub Created'),
              position: 'topright',
              dismissAfter: 3000,
              onDismiss() {_this.onComplete(model.hub_id);}
          });
        }
      });
     },


  onComplete (hub_id) {
    var url = urlUtil.getBaseUrl() + '/hub/' + hub_id;
    window.location = url;
  },


	render() {

    if(!this.props.groups || this.props.groups.length == 0){
      return (
        <div className="container">
          <div className="row">
            <h5>{this.__('Please Join a Group')}</h5>
            <p>{this.__('Please create or join a group before creating a hub.')}</p>
          </div>
        </div>
      );
    }

		return (
      <div>
          <Header />
        <div className="container">
          <h4>{this.__('Create a Hub')}</h4>
            <div className="row">
              <Progress id="create-hub-progess" title={this.__('Creating Hub')} dismissible={false} show={this.state.saving}/>
              <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
                <div className="row">
                  <TextInput name="hub_id" label={this.__('Hub ID')} icon="group_work" className="col s6"
                        disabled={this.state.hub.created}
                        validations={{matchRegexp: /^[a-zA-Z0-9-]*$/, maxLength:25, isAvailable:true}} validationErrors={{
                         maxLength: this.__('ID must be 25 characters or less.'),
                         matchRegexp: this.__('Can only contain letters, numbers, or dashes.'),
                         isAvailable: this.__('ID already taken, please try another.')
                     }} length={25}
                     successText={this.__('ID is Available')}
                     dataPosition="right" dataTooltip="Identifier for the Hub. This will be used in links and URLs for your hub's content."
                     required/>
                </div>
                <div className="row">
                  <TextInput name="name" label={this.__('Name')} icon="info" className="col s12" validations="maxLength:100" validationErrors={{
                         maxLength: this.__('Name must be 100 characters or less.')
                     }} length={100}
                     dataPosition="top" dataTooltip={this.__('Short Descriptive Name for the Hub')}
                     required/>
                </div>
                <div  className="row">
                  <SelectGroup groups={this.props.groups} type="hub" canChangeGroup={true} editing={false}/>
                </div>
                <div className="right">
                    <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
                </div>

              </Formsy.Form>
           </div>
        </div>
      </div>
		);
	}
});

module.exports = HubBuilder;
