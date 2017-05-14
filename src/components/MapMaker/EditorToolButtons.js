//@flow
import React from 'react';
import DataEditorActions from '../../actions/DataEditorActions';
import DataEditorStore from '../../stores/DataEditorStore';
import MapToolButton from '../Map/MapToolButton';
import MessageActions from '../../actions/MessageActions';
import NotificationActions from '../../actions/NotificationActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
import Progress from '../Progress';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {DataEditorStoreState} from '../../stores/DataEditorStore';

type Props = {
  stopEditingLayer: Function
}

type State = {
   saving: boolean
} & LocaleStoreState & DataEditorStoreState

export default class EditorToolButtons extends MapHubsComponent<void, Props, State> {

  props: Props

 state: State = {
    saving: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(DataEditorStore);
  }

  saveEdits = (cb: Function) => {
    var _this = this;
    this.setState({saving: true});
    DataEditorActions.saveEdits(this.state._csrf, (err) => {
      //TODO: notify user
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{   
         NotificationActions.showNotification({
          message: _this.__('Edits Saved'),
        });
        if(cb)cb();
      }

    });
  }

  stopEditing = () => {
     var _this = this;
     if(this.state.edits.length > 0){
      ConfirmationActions.showConfirmation({
        title: _this.__('Unsaved Edits'),
        message: _this.__('Do you want to save your edits before exiting?'),
        postitiveButtonText: _this.__('Save Edits'),
        negativeButtonText: _this.__('Discard Edits'),
        onPositiveResponse(){
          _this.saveEdits(()=>{
            _this.props.stopEditingLayer();  
          });    
        },
        onNegativeResponse(){
          _this.props.stopEditingLayer();   
        }
       });
     }else{
      this.props.stopEditingLayer();    
     } 
  }

  render(){
   
    return (
       <div>         
          <MapToolButton  top="10px" right="85px" icon="undo" show={true} color="#000"
            disabled={this.state.edits.length === 0}
            onClick={DataEditorActions.undoEdit} tooltipText={this.__('Undo')} />
          <MapToolButton  top="10px" right="50px" icon="redo" show={true} color="#000"
            disabled={this.state.redo.length === 0}
            onClick={DataEditorActions.redoEdit} tooltipText={this.__('Redo')} />
          <MapToolButton  top="45px" right="10px" icon="save" show={true} color="#000"
           disabled={this.state.edits.length === 0}
            onClick={this.saveEdits} tooltipText={this.__('Save Edits')} />
          <MapToolButton  top="80px" right="10px" icon="close" show={true} color="#000"
            onClick={this.stopEditing} tooltipText={this.__('Stop Editing')} />
          <Progress id="saving-edits" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
        </div>
    );
    
  }
}