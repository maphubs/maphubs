import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var classNames = require('classnames');
var slug = require('slug');

var Header = require('../components/header');
var Step1 = require('../components/CreateLayer/Step1');
var Step2 = require('../components/CreateLayer/Step2');
//var Step3 = require('../components/CreateLayer/Step3');
//var Step4 = require('../components/CreateLayer/Step4');
var Step5 = require('../components/CreateLayer/Step5');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerStore = require('../stores/layer-store');
//var emptyLayer = require('../stores/empty-layer');
var debug = require('../services/debug');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateLayer = React.createClass({

  mixins:[StateMixin.connect(LayerStore, {initWithProps: ['groups', 'layer']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		groups: PropTypes.array,
    layer: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      groups: []
    };
  },

  getInitialState() {
    return {
      step: 1
    };
  },

  componentDidMount(){
    var _this = this;

    window.onunload = function(){
      if(_this.state.layer.layer_id && _this.state.layer.layer_id != -1 && !_this.state.layer.complete){
        $.ajax({
         type: "POST",
         url: '/api/layer/admin/delete',
         contentType : 'application/json;charset=UTF-8',
         dataType: 'json',
         data: JSON.stringify({layer_id: _this.state.layer.layer_id, _csrf: _this.state._csrf}),
          async: false,
          success(){

          },
          error(msg){
            debug(msg);
          }
        });
      }
    };

    window.onbeforeunload = function(){
      if(_this.state.layer.layer_id && _this.state.layer.layer_id != -1 && !_this.state.layer.complete){
        return _this.__('You have not finished creating your layer, if you leave now your layer will be deleted.');
      }else if (!_this.state.layer.layer_id || _this.state.layer.layer_id == -1) {
        return _this.__('You have not finished creating your layer.');
      }
    };
  },


    submit(layer_id, name){
        window.location = '/layer/info/' + layer_id + '/' + slug(name);
    },

    nextStep () {
      this.setState({step: this.state.step + 1});
    },

    prevStep () {
      this.setState({step: this.state.step - 1});
    },

	render() {

    if(!this.state.groups || this.state.groups.length == 0){
      return (
        <div>
            <Header />
          <main>
        <div className="container">
          <div className="row">
            <h5>{this.__('Please Join a Group')}</h5>
            <p>{this.__('Please create or join a group before creating a layer.')}</p>
          </div>
        </div>
        </main>
        </div>
      );
    }

    var stepText = this.__('Step') + ' ' + this.state.step;
    var progressWidth = '';

    var progressClassName = classNames('determinate', progressWidth);
    var step1 = '';
    if(this.state.step === 1){
      progressWidth = 'width-25';
      step1 = (
        <Step1 onSubmit={this.nextStep}/>
      );
    }
    var step2 = '';
    if(this.state.step === 2){
       progressWidth = 'width-50';
      step2 = (
        <Step2  groups={this.props.groups} showPrev={true} onPrev={this.prevStep} onSubmit={this.nextStep} />
      );
    }
    var step3 = '';
    if(this.state.step === 3){
       progressWidth = 'width-75';
      step3 = (
        <Step5 showPrev={true} onPrev={this.prevStep} onSubmit={this.submit} />         
      );
    }

		return (
      <div>
          <Header />
        <main>
          <div style={{marginLeft: '10px', marginRight: '10px'}}>
            <h5>{this.__('Create Layer')}</h5>
            <div className="row center no-margin">

              <b>{stepText}</b>

                <div className="progress">
                    <div className={progressClassName}></div>
                </div>
            </div>
            {step1}
            {step2}
            {step3}
            </div>
        </main>

      </div>
		);
	}
});

module.exports = CreateLayer;
