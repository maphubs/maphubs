//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
var $ = require('jquery');
import MapStyles from '../Map/Styles';
import MapHubsPureComponent from '../MapHubsPureComponent';

import type {GLStyle} from '../../types/mapbox-gl-style';
import type {Layer} from '../../stores/layer-store'; 

type Props = {|
   onChange: Function,
    layer: Layer,
    style: GLStyle
|}

type DefaultProps = {

}

type State = {
  style: GLStyle,
  interactive: boolean,
  showBehindBaseMapLabels: boolean
}

export default class AdvancedLayerSettings extends MapHubsPureComponent<DefaultProps, Props, State> {

  props: Props

  state: State

  constructor(props: Props){
    super(props);
    this.getStateFromStyleProp(props);
    
  }

  getStateFromStyleProp(props: Props){
    let defaults = MapStyles.settings.defaultLayerSettings();
    if(props.layer.layer_id && props.layer.data_type && props.style){
      let glLayerId = `omh-data-${props.layer.data_type}-${props.layer.layer_id}`;
    
      let interactive = defaults.interactive;
      let interactiveSetting: any = MapStyles.settings.getLayerSetting(props.style,glLayerId, 'interactive');
      if(typeof interactiveSetting !== 'undefined'){
        interactive = interactiveSetting;
      }
      
      let showBehindBaseMapLabels = defaults.showBehindBaseMapLabels;
      let showBehindBaseMapLabelsSetting = MapStyles.settings.getLayerSetting(props.style,glLayerId, 'showBehindBaseMapLabels');
      if(typeof showBehindBaseMapLabels !== 'undefined'){
        showBehindBaseMapLabels = showBehindBaseMapLabelsSetting;
      }
      this.state = {
        style: props.style,
        interactive,
        showBehindBaseMapLabels
      };
    }
    
  }

  componentDidMount(){
    $('.tooltip-advanced-layer-settings').tooltip();
  }

  componentWillReceiveProps(nextProps: Props){
    this.getStateFromStyleProp(nextProps);
  }

   onFormChange = (values: Object) => {

     let dataType = this.props.layer.data_type? this.props.layer.data_type : '';
     let layer_id = this.props.layer.layer_id? this.props.layer.layer_id: 0;

     var style = this.state.style;
     if(values.interactive !== this.state.interactive){
       let glLayerId = `omh-data-${dataType}-${layer_id}`;
       style = MapStyles.settings.setLayerSetting(this.state.style, glLayerId ,'interactive', values.interactive);       
     }else if(values.showBehindBaseMapLabels !== this.state.showBehindBaseMapLabels){
        style = MapStyles.settings.setLayerSettingAll(this.state.style, 'showBehindBaseMapLabels', values.showBehindBaseMapLabels, 'symbol');
     }else{
       //nochange
       return;
     }

     this.setState({style});
     this.props.onChange(style);
  }

  render(){
    return (
        <div className="row" style={{marginLeft: '10px'}}>
          <Formsy.Form ref="form" onChange={this.onFormChange}>
            <div className="row">
              <b>{this.__('Interactive')}</b>
               <Toggle name="interactive" labelOff={this.__('Off')} labelOn={this.__('On')} className="tooltip-advanced-layer-settings"
                  checked={this.state.interactive}
                  dataPosition="right" dataTooltip={this.__('Allow users to interact with this layer by clicking the map')}
                />
            </div>
            <div className="row">
              <b>{this.__('Show Below Base Map Labels')}</b>
                <Toggle name="showBehindBaseMapLabels" className="tooltip-advanced-layer-settings" labelOff={this.__('Off')} labelOn={this.__('On')}
                  checked={this.state.showBehindBaseMapLabels}
                  dataPosition="right" dataTooltip={this.__('Allow base map labels to display on top of this layer')}
                />
            </div>

          </Formsy.Form>
        </div>
    );
  }
}