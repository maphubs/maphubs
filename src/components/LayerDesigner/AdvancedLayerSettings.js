//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
var $ = require('jquery');
import styles from '../Map/styles';
import MapHubsPureComponent from '../MapHubsPureComponent';

export default class AdvancedLayerSettings extends MapHubsPureComponent {

  props: {
    onChange: Function,
    layer: Object,
    style: Object,
    settings: Object
  }

  static defaultProps = {
    style: null,
    layer: null,
    settings: null
  }

  constructor(props: Object){
    super(props);
    this.state = {
      style: this.props.style,
      settings: this.props.settings ? this.props.settings : styles.defaultSettings()
    };
  }

  componentDidMount(){
    $('.tooltip-advanced-layer-settings').tooltip();
  }

  componentWillReceiveProps(nextProps: Object){
    if(nextProps.settings){
      this.setState({style: nextProps.style, settings: nextProps.settings});
    }else{
      this.setState({style: nextProps.style});
    }
  }

   onFormChange = (values: Object) => {

     var style = this.state.style;
     if(values.interactive !== this.state.settings.interactive){
        style = styles.toggleInteractive(values.interactive, this.state.style, this.props.layer.layer_id, this.props.layer.data_type);
     }else if(values.showBehindBaseMapLabels !== this.state.settings.showBehindBaseMapLabels){
        style = styles.toggleShowBehindBaseMapLabels(values.showBehindBaseMapLabels, this.state.style);
     }else{
       //nochange
       return;
     }

     var settings = this.state.settings;
     Object.keys(values).map(function(key){
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