//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
var $ = require('jquery');
import MapStyles from '../Map/Styles';
import MapHubsPureComponent from '../MapHubsPureComponent';

type Props = {
   onChange: Function,
    layer: Object,
    style: Object
}

type DefaultProps = {

}

type State = {
  style: Object,
  interactive: boolean,
  showBehindBaseMapLabels: boolean
}

export default class AdvancedLayerSettings extends MapHubsPureComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    style: null,
    layer: null
  }

  state: State

  constructor(props: Props){
    super(props);
    this.getStateFromStyleProp(props);
    
  }

  getStateFromStyleProp(props: Props){
    let defaults = MapStyles.settings.defaultLayerSettings();
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

  componentDidMount(){
    $('.tooltip-advanced-layer-settings').tooltip();
  }

  componentWillReceiveProps(nextProps: Object){
    this.getStateFromStyleProp(nextProps);
  }

   onFormChange = (values: Object) => {

     var style = this.state.style;
     if(values.interactive !== this.state.settings.interactive){
       let glLayerId = `omh-data-${this.props.layer.data_type}-${this.props.layer.layer_id}`;
       style = MapStyles.settings.setLayerSetting(this.state.style, glLayerId ,'interactive', values.interactive);       
     }else if(values.showBehindBaseMapLabels !== this.state.settings.showBehindBaseMapLabels){
        style = MapStyles.settings.setLayerSettingAll(this.state.style, 'showBehindBaseMapLabels', values.showBehindBaseMapLabels, 'symbol');
     }else{
       //nochange
       return;
     }

     var settings = this.state.settings;
     Object.keys(values).map((key) => {
       settings[key] = values[key];
     });

     this.setState({style, settings});
     this.props.onChange(style, settings);
  }

  render(){
    return (
        <div className="row" style={{marginLeft: '10px'}}>
          <Formsy.Form ref="form" onChange={this.onFormChange}>
            <div className="row">
              <b>{this.__('Interactive')}</b>
               <Toggle name="interactive" labelOff={this.__('Off')} labelOn={this.__('On')} className="tooltip-advanced-layer-settings"
                  checked={this.state.settings.interactive}
                  dataPosition="right" dataTooltip={this.__('Allow users to interact with this layer by clicking the map')}
                />
            </div>
            <div className="row">
              <b>{this.__('Show Below Base Map Labels')}</b>
                <Toggle name="showBehindBaseMapLabels" className="tooltip-advanced-layer-settings" labelOff={this.__('Off')} labelOn={this.__('On')}
                  checked={this.state.settings.showBehindBaseMapLabels}
                  dataPosition="right" dataTooltip={this.__('Allow base map labels to display on top of this layer')}
                />
            </div>

          </Formsy.Form>
        </div>
    );
  }
}