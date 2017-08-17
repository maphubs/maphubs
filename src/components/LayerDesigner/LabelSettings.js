//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
import Select from '../forms/select';
var $ = require('jquery');
import MapStyles from '../Map/Styles';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';

type Labels = {
  enabled: boolean,
  field: string
}

type Props = {|
  onChange: Function,
  layer: Object,
  style: Object,
  labels: Labels
|}

type DefaultProps = {
  labels: Labels
}

type State = {
  style: Object,
  enabled: boolean,
  field: string
}

export default class LabelSettings extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    labels: {
      enabled: false,
      field: ''
    }
  }

  state: State

  constructor(props: Props){
    super(props);
    let enabled = false;
    let field: string = '';
    if(props.labels){
      enabled = props.labels.enabled ? true : false;
      field = props.labels.field;
    }

    this.state = {
      style: props.style,
      enabled,
      field
    };
  }

  componentDidMount(){
    $('.tooltip-label-settings').tooltip();
  }

  componentWillReceiveProps(nextProps: Props){
    this.setState({style: nextProps.style});
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

   onFormChange = (values: Object) => {
    if(values.enabled && values.field){
      //add labels to style
      var style = MapStyles.labels.addStyleLabels(this.state.style, values.field, this.props.layer.layer_id, this.props.layer.data_type);
      this.setState({style, enabled: true, field: values.field});
      this.props.onChange(style, values);
    } else if(values.enabled && !values.field){
      this.setState({enabled: true});
    } else{
      //remove labels from style
      style = MapStyles.labels.removeStyleLabels(this.state.style);
      this.setState({style, enabled: false});
      this.props.onChange(style, values);
    }
    $('.tooltip-label-settings').tooltip('remove');
    $('.tooltip-label-settings').tooltip();
  }

  render(){
    var _this = this;
    var fieldOptions = [];

    let presets;
    if(this.props.layer.style && this.props.layer.style.sources){
      let sourceKeys =  Object.keys(this.props.layer.style.sources);
      if(sourceKeys && sourceKeys.length > 0){
        let firstSource = Object.keys(this.props.layer.style.sources)[0];
        presets = MapStyles.settings.getSourceSetting(this.props.style, firstSource, 'presets');
      }
    }
    
    if(presets){
      presets.forEach((preset) => {
        fieldOptions.push({
          value: preset.tag,
          label: _this._o_(preset.label)
          });
      });

    }else{
      return (
        <div>
          <div className="row">
            <p>{this.__('Not available for this layer')}</p>
          </div>
        </div>
      );
    }

    var invalidMessage = '';
    if(this.state.enabled && !this.state.field){
      invalidMessage = (
        <p style={{color: 'red'}}>{this.__('Please Select a Label Field')}</p>
      );
    }

    return (
      <div>
        <div className="row">
          <Formsy.Form ref="form" onChange={this.onFormChange}>
           <div className="row" style={{marginTop: '10px', marginBottom: '0px', padding: '0 .75rem'}}>
            <b>{this.__('Enable Labels')}</b>
             <Toggle name="enabled" labelOff={this.__('Off')} labelOn={this.__('On')} className="col s12 tooltip-label-settings"
                       checked={this.state.enabled}
                        dataPosition="right" dataTooltip={this.__('Enable Labels for this Layer')}
                        />
            </div>
            <div className="row no-margin">
              <Select name="field" id="label-field-select" label={this.__('Label Field')} options={fieldOptions} 
              className="col s12 label-field no-margin"
                    value={this.state.field} startEmpty={this.state.field ? false : true}
                   dataPosition="right" dataTooltip={this.__('Data field to use in map labels.')}
                   required/>
            </div>
          </Formsy.Form>
          {invalidMessage}
        </div>
      </div>
    );
  }
}