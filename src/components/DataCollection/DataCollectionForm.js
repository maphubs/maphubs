var React = require('react');

var Formsy = require('formsy-react');
var FormField =require('./FormField');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var DataCollectionForm = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },


  propTypes: {
		presets: React.PropTypes.array.isRequired,
    values: React.PropTypes.object,
    showSubmit: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
    onValid: React.PropTypes.func,
    onInValid: React.PropTypes.func,
    onChange:  React.PropTypes.func,
    submitText: React.PropTypes.string
  },

  getDefaultProps(){
    return {
      showSubmit: true
    };
  },

  getInitialState(){
    var submitText = '';
    if(this.props.submitText){
      submitText = this.props.submitText;
    }else if(this.state && this.state.locale){
      submitText = Locales.getLocaleString(this.state.locale, 'Submit');
    }
    else{
      submitText = 'Submit';
    }
    return {
      canSubmit: false,
      submitText
    };
  },

  onSubmit(model){
    this.props.onSubmit(model);
  },

  onValid(){
    this.setState({canSubmit: true});
    if(this.props.onValid) this.props.onValid();
  },

  onInValid(){
    this.setState({canSubmit: false});
    if(this.props.onValid) this.props.onInValid();
  },

  onChange(model){
    if(this.props.onChange) this.props.onChange(model);
  },

  render() {
    var _this = this;

    var submit = '';
    if(this.props.showSubmit){
      submit = (
        <div className="right">
          <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.state.submitText}</button>
        </div>
      );
    }

    return (
      <Formsy.Form onValidSubmit={this.onSubmit} onChange={this.onChange} onValid={this.onValid} onInvalid={this.onInValid}>
        {
          this.props.presets.map(function(preset){
            var value;
            if(_this.props.values && _this.props.values[preset.tag]){
              value = _this.props.values[preset.tag];
            }
            if(preset.tag != 'photo_url'){
              return (
                <FormField key={preset.tag} preset={preset} value={value} />
              );
            }
          })        
        }
        {submit}
      </Formsy.Form>
    );
  }
});

module.exports = DataCollectionForm;
