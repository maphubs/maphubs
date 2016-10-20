var React = require('react');
var Formsy = require('formsy-react');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var styles = require('../Map/styles');

var LabelSettings = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
    labels: React.PropTypes.object
  },

  getDefaultProps(){
    return {
      style: null,
      layer: null,
      labels: {}
    };
  },

  getInitialState(){
    var enabled = false;
    var field = null;
    if(this.props.labels){
      enabled = this.props.labels.enabled ? true : false;
      field = this.props.labels.field;
    }

    return {
      style: this.props.style,
      enabled,
      field
    };
  },

  componentWillReceiveProps(nextProps){
    this.setState({style: nextProps.style});
  },

   onFormChange(values){
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
  },

  render(){

    var fieldOptions = [];

    if(this.props.layer && this.props.layer.presets){
      this.props.layer.presets.forEach(function(preset){
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
             <Toggle name="enabled" labelOff="Off" labelOn="On" className="col l6 m6 s12"
                       defaultChecked={this.state.enabled}
                        dataPosition="right" dataTooltip={this.__('Enable Labels for this Layer')}
                        />
              <Select name="field" id="label-field-select" label={this.__('Label Field')} options={fieldOptions} className="col l6 m6 s12 label-field"
                    value={this.state.field} defaultValue={this.state.field} startEmpty={this.state.field ? false : true}
                   dataPosition="top" dataTooltip={this.__('Data field to use in map labels.')}
                   required/>
          </Formsy.Form>
          {invalidMessage}
        </div>
      </div>
    );
  }
});

module.exports = LabelSettings;
