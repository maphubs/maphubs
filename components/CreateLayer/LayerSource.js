
var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

//react components
var Formsy = require('formsy-react');
var TextInput = require('../forms/textInput');
var Select = require('../forms/select');


var LayerStore = require('../../stores/layer-store');
var LayerActions = require('../../actions/LayerActions');
var MessageActions = require('../../actions/MessageActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var Licenses = require('./licenses');

var LayerSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func,
    onValid: React.PropTypes.func,
    onInValid: React.PropTypes.func,
    showPrev: React.PropTypes.bool,
    prevText: React.PropTypes.string,
    onPrev: React.PropTypes.func,
    submitText: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      layer_id: null,
      onSubmit: null,
      active: false,
      submitText: 'Save'
    };
  },

  getInitialState() {
    return {
      canSubmit: false
    };
  },


  onSubmit(formData) {
    var _this = this;
    //save presets
    LayerActions.saveSource(formData, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        if(_this.props.onSubmit){
          _this.props.onSubmit();
        }
      }
    });

  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },


  onValid () {
      this.setState({
        canSubmit: true
      });
      if(this.props.onValid){
        this.props.onValid();
      }
    },
    onInvalid () {
      this.setState({
        canSubmit: false
      });
      if(this.props.onInValid){
        this.props.onInValid();
      }
    },

	render() {

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.props.prevText}</a>
        </div>
      );
    }

    var licenseOptions = Licenses.getLicenses(this.__);

    var defaultLicense = 'none';
    if(this.state.layer.license){
      defaultLicense = this.state.layer.license;
    }

		return (
        <div className="container">

            <Formsy.Form onValidSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInValid}>
              <h5>{this.__('Source Information')}</h5>
              <div className="row">
                <TextInput name="source" label={this.__('Source Description')} icon="explore" className="col s12"
                  value={this.state.layer.source}
                  validations="maxLength:300" validationErrors={{
                       maxLength: this.__('Name must be 300 characters or less.')
                   }} length={300}
                   dataPosition="top" dataTooltip={this.__('Short Description of the Layer Source')}
                   required/>
              </div>
              <div  className="row">
                  <Select name="license" id="layer-source-select" label={this.__('License')} startEmpty={false}
                    value={this.state.layer.license} defaultValue={defaultLicense} options={licenseOptions}
                    note={this.__('Select a license for more information')}
                    className="col s8"
                    dataPosition="top" dataTooltip={this.__('Layer License')}
                    />
                </div>

              {prevButton}
              <div className="right">
                <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.props.submitText}</button>
              </div>
              </Formsy.Form>


      </div>
		);
	}
});

module.exports = LayerSource;
