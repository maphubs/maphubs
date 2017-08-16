// @flow
import React from 'react';
import Header from '../components/header';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import BaseMapStore from '../stores/map/BaseMapStore';

import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import ConfirmationActions from '../actions/ConfirmationActions';
import Progress from '../components/Progress';
import type {LocaleStoreState} from '../stores/LocaleStore';
import type {AddPhotoPointStoreState} from '../stores/AddPhotoPointStore';


type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  mapConfig: Object,
  headerConfig: Object
}

type State = {
  saving: boolean
} & LocaleStoreState & AddPhotoPointStoreState

export default class AddPhotoPoint extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State = {
    saving: false,
    layer: {}
  }

  constructor(props: Props){
		super(props);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
	}

  componentDidMount(){
    var _this = this;
    window.onbeforeunload = function(){
      if(!_this.state.submitted){
        return _this.__('You have not saved your data, your work will be lost.');
      }
    };
  }

  onDataSubmit = () => {

  }


  render(){

    let localSource = '';
    if(this.state.downloaded){
      localSource = (
        <UploadLocalSource showPrev={false} onSubmit={this.onDataSubmit} mapConfig={this.props.mapConfig} />
      );
    }

    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <div className="container">
            <div className="row center-align">
              <h5>{this.__('Replace data in layer:') + ' ' + this._o_(this.props.layer.name)}</h5>
              {addPhotoButton}
            </div>
            <div className="row">
              {localSource}
            </div>
          </div>
          <Progress id="saving" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
        </main>
      </div>
    );
  }
}