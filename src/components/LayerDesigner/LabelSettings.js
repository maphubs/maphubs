//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Toggle from '../forms/toggle';
import Select from '../forms/select';
var $ = require('jquery');
import styles from '../Map/styles';
import MapHubsPureComponent from '../MapHubsPureComponent';

export default class LabelSettings extends MapHubsPureComponent {

  props: {
    onChange: Function,
    layer: Object,
    style: Object,
    labels: Object
  }

  static defaultProps = {
    style: null,
    layer: null,
    labels: {}
  }

  constructor(props: Object){
    super(props);
    var enabled = false;
    var field = null;
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

  componentWillReceiveProps(nextProps: Object){
    this.setState({style: nextProps.style});
  }

   onFormChange = (values: Object) => {
    if(values.enabled && values.field){
      //add labels to style
      var style = styles.addStyleLabels(this.state.style, values.field, this.props.layer.layer_id, this.props.layer.data_type);
      this.setState({style, enabled: true, field: values.field});
      this.props.onChange(style, values);
    } else if(values.enabled && !values.field){
      this.setState({enabled: true});
    } else{
      //remove labels from style
      style = styles.removeStyleLabels(this.state.style);
      this.setState({style, enabled: false});
      this.props.onChange(style, values);
    }
    $('.tooltip-label-settings').tooltip('remove');
    $('.tooltip-label-settings').tooltip();
  }

  render(){

    var fieldOptions = [];

    if(this.props.layer && this.props.layer.presets){
      this.props.layer.presets.forEach((preset) => {
        fieldOptions.push({
          value: preset.tag,
          label: preset.label
          });
      });

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
              <Select name="field" id="label-field-select" label={this.__('Label Field')} options={fieldOptions} className="col s10 label-field tooltip-label-settings no-margin"
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