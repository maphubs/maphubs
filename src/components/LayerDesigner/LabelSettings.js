var React = require('react');
var Formsy = require('formsy-react');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var $ = require('jquery');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var styles = require('../Map/styles');

var LabelSettings = React.createClass({

  mixins:[PureRenderMixin, StateMixin.connect(LocaleStore)],

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

  componentDidMount(){
    $('.tooltip-label-settings').tooltip();
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
    $('.tooltip-label-settings').tooltip('remove');
    $('.tooltip-label-settings').tooltip();
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
           <div className="row" style={{marginTop: '10px', marginBottom: '0px'}}>
            <b>{this.__('Enable Labels')}</b>
             <Toggle name="enabled" labelOff={this.__('Off')} labelOn={this.__('On')} className="col s12 tooltip-label-settings"
                       defaultChecked={this.state.enabled}
                        dataPosition="right" dataTooltip={this.__('Enable Labels for this Layer')}
                        />
            </div>
            <div className="row no-margin">
              <Select name="field" id="label-field-select" label={this.__('Label Field')} options={fieldOptions} className="col s10 label-field tooltip-label-settings no-margin"
                    value={this.state.field} defaultValue={this.state.field} startEmpty={this.state.field ? false : true}
                   dataPosition="right" dataTooltip={this.__('Data field to use in map labels.')}
                   required/>
            </div>
          </Formsy.Form>
          {invalidMessage}
        </div>
      </div>
    );
  }
});

module.exports = LabelSettings;
