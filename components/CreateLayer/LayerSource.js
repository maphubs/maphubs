
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

    var licenseOptions = [
      {value: 'none',label: 'No License Provided', note: '<p>' + this.__('License is not known or is not provided') + '</p>'},
      {value: 'odc-by',label: 'Open Data Commons Attribution License', note: '<a target="_blank" href="http://opendatacommons.org/licenses/by/">http://opendatacommons.org/licenses/by/</a>'},
      {value: 'odc-odbl',label: 'ODC Open Database License', note: '<a target="_blank" href="http://opendatacommons.org/licenses/odbl/">http://opendatacommons.org/licenses/odbl/</a>'},
      {value: 'odc-pddl',label: 'ODC Public Domain Dedication and License', note: '<a target="_blank" href="http://opendatacommons.org/licenses/pddl/">http://opendatacommons.org/licenses/pddl/</a>'},
      {value: 'cc-by',label: 'Creative Commons Attribution (CC BY)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>'},
      {value: 'cc-by-sa',label: 'Creative Commons Attribution-ShareAlike (CC BY-SA)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0">https://creativecommons.org/licenses/by-sa/4.0</a>'},
      {value: 'cc-by-nd',label: 'Creative Commons Attribution-NoDerivs (CC BY-ND)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by-nd/4.0/">https://creativecommons.org/licenses/by-nd/4.0/</a>'},
      {value: 'cc-by-nc',label: 'Creative Commons Attribution-NonCommercial (CC BY-NC)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by-nc/4.0/">https://creativecommons.org/licenses/by-nc/4.0/</a>'},
      {value: 'cc-by-nc-sa',label: 'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">https://creativecommons.org/licenses/by-nc-sa/4.0/</a>'},
      {value: 'cc-by-nc-nd',label: 'Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)', note: '<a target="_blank" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">https://creativecommons.org/licenses/by-nc-nd/4.0/</a>'}
    ];

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
                  validations="maxLength:100" validationErrors={{
                       maxLength: this.__('Name must be 100 characters or less.')
                   }} length={100}
                   dataPosition="top" dataTooltip={this.__('Short Description of the Layer Source')}
                   required/>
              </div>
              <div  className="row">
                  <Select name="license" label={this.__('License')} startEmpty={false}
                    value={this.state.layer.license} defaultValue={defaultLicense} options={licenseOptions}
                    note={this.__('Select a license for more information')}
                    className="col s8"
                    dataPosition="top" dataTooltip={this.__('Layer License')}
                    required/>
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
