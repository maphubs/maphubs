//@flow
import React from 'react';
import PresetForm from './PresetForm';
import PresetStore from '../../stores/preset-store';
import Actions from '../../actions/presetActions';
import MapHubsComponent from '../MapHubsComponent';

export default class PresetEditor extends MapHubsComponent {

  props: {
    onValid: Function,
    onInvalid: Function,
    warnIfUnsaved: boolean
  }

  static defaultProps = {
    warnIfUnsaved: true
  }

  constructor(props: Object){
    super(props);
    this.stores.push(PresetStore);
  }

  componentDidMount(){
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.props.warnIfUnsaved && _this.state.store.pendingChanges){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  }

  addPreset = () => {
    Actions.addPreset();
  }

  onValid = () => {
    if(this.props.onValid) this.props.onValid();
  }

  onInvalid = () => {
    if(this.props.onInvalid) this.props.onInvalid();
  }

	render() {
    var _this = this;
    var presets = [];
    if(this.state.presets && Array.isArray(this.state.presets)){
      presets = this.state.presets;
    }
		return (
        <div>
          <div className="row no-padding">
            <div className="left">
              <a className="waves-effect waves-light btn" onClick={this.addPreset}><i className="material-icons right">add</i>{this.__('Add Field')}</a>
            </div>
          </div>
          <ul className="collection">
            {
                presets.map((preset) => {
                  return(
                   <li key={preset.id} className="collection-item attribute-collection-item">
                       <PresetForm ref={preset.tag} {...preset}
                         onValid={_this.onValid}
                         onInvalid={_this.onInvalid}
                         />
                     </li>
                   );
                })
            }
          </ul>
      </div>
		);
	}
}