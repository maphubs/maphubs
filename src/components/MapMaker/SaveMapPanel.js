//@flow
import React from 'react';
import MapMakerStore from '../../stores/MapMakerStore';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import Formsy from 'formsy-react';
import MultiTextInput from '../forms/MultiTextInput';
import NotificationActions from '../../actions/NotificationActions';
import SelectGroup from '../Groups/SelectGroup';
import Toggle from '../forms/toggle';
import MapHubsComponent from '../MapHubsComponent';
import Locales from '../../services/locales';

import type {MapMakerStoreState} from '../../stores/MapMakerStore';
import type {UserStoreState} from '../../stores/UserStore';

type Props = {|
  onSave: Function,
  groups: Array<Object>
|}

type State = {
  canSave: boolean,
  ownedByGroup: boolean,
  saving?: boolean
} & MapMakerStoreState & UserStoreState

export default class SaveMapPanel extends MapHubsComponent<Props, State> {

  props: Props

  constructor(props: Props){
    super(props);
    this.stores.push(MapMakerStore);
    this.stores.push(UserStore);
    var ownedByGroup = false;
    if(this.props.groups && this.props.groups.length > 0){
      //suggest a group by default if user is member of groups
      ownedByGroup = true;
    }
    this.state = {
      canSave: false,
      ownedByGroup
    };
  }

  enableSaveButton = () => {
    this.setState({
      canSave: true
    });
  }

  disableSaveButton = () => {
    this.setState({
      canSave: false
    });
  }

  recheckLogin = () => {
    UserActions.getUser((err) => {
      if(err){
        NotificationActions.showNotification({message: this.__('Not Logged In - Please Login Again'), dismissAfter: 3000, position: 'topright'});
      }
    });
  }

  onSave = (model: Object) => {
    var _this = this;
    model.title = Locales.formModelToLocalizedString(model, 'title');
    if(!model.title || this._o_(model.title) === ''){
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'topright'});
      return;
    }

    if(!model.group && this.props.groups.length === 1){
        //creating a new layer when user is only the member of a single group (not showing the group dropdown)
        model.group = this.props.groups[0].group_id;
      }
    this.setState({saving: true});
    this.props.onSave(model, () =>{
      _this.setState({saving: false});
    });
  }

  onOwnedByGroup = (ownedByGroup: boolean) =>{
    this.setState({ownedByGroup});
  }

  render(){

    var groups = '', groupToggle = '', editing = false;
    if(this.props.groups && this.props.groups.length > 0){
   
        if(this.state.map_id && this.state.map_id > 0){
          editing = true;
        }else{
          //if the user is in a group, show group options
          groupToggle = (
            <div className="row">   
              <Toggle name="ownedByGroup" labelOff={this.__('Owned by Me')} labelOn={this.__('Owned by My Group')} 
              checked={this.state.ownedByGroup} className="col s12"
              onChange={this.onOwnedByGroup}
                  dataPosition="right" dataTooltip={this.__('Select who should own this map')}
                />
            </div>  
          );
        }
  
      if(this.state.ownedByGroup){
        //show group selection
         groups = (
          <div className="row">       
            <SelectGroup groups={this.props.groups} group_id={this.state.owned_by_group_id} type="map" canChangeGroup={!editing} editing={editing}/>
          </div>        
        );
      }
     
    }else{
      //owned by the user account is the default, display a message about groups?
    }

    if(this.state.loggedIn){
     return (
        <Formsy onValidSubmit={this.onSave} onValid={this.enableSaveButton} onInvalid={this.disableSaveButton}>
          <div className="row">
            <MultiTextInput name="title" id="title"
              value={this.state.title}
              label={{
                en: 'Map Title', fr: 'Titre de la carte', es: 'Título del mapa', it: 'Titolo della mappa'
              }}
              className="col s12" 
              validations="maxLength:100" validationErrors={{
                        maxLength: this.__('Name must be 100 characters or less.')
               }} length={100}
               required/>
          </div>
          {groupToggle}
          {groups}
          <div className="row">
            <div className="col s12 valign-wrapper">
                  <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} 
                  disabled={(!this.state.canSave || this.state.saving)}>{this.__('Save Map')}</button>
            </div>
          </div>

        </Formsy>
      );
    }else{
     return (
        <div>
          <div className="row center-align">
            <p>{this.__('You must login or sign up before saving a map.')}</p>
          </div>
          <div className="row center-align">
            <a className="btn" href="/login" target="_blank" rel="noopener noreferrer">{this.__('Login')}</a>
          </div>
          <div className="row center-align">
            <a className="btn" onClick={this.recheckLogin}>{this.__('Retry')}</a>
          </div>
        </div>
      );
    }

  }
}