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
		presets: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onValid: React.PropTypes.func,
    onInValid: React.PropTypes.func,
    submitText: React.PropTypes.string
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

  render() {
    return (
      <Formsy.Form onValidSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInValid}>
        {
          this.props.presets.map(function(preset){
            if(preset.tag != 'photo_url'){
              return (
                <FormField preset={preset} />
              );
            }
          })        
        }
        <div className="right">
          <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.state.submitText}</button>
        </div>
      </Formsy.Form>
    );
  }
});

module.exports = DataCollectionForm;
