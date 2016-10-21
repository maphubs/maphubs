var React = require('react');
var $ = require('jquery');
var classNames = require('classnames');
var slug = require('slug');

var Header = require('../components/header');
var Step1 = require('../components/CreateLayer/Step1');
var Step2 = require('../components/CreateLayer/Step2');
var Step3 = require('../components/CreateLayer/Step3');
//var Step4 = require('../components/CreateLayer/Step4');
var Step5 = require('../components/CreateLayer/Step5');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerStore = require('../stores/layer-store');
var emptyLayer = require('../stores/empty-layer');
var debug = require('../services/debug');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateLayer = React.createClass({

  mixins:[StateMixin.connect(LayerStore, {initWithProps: ['groups', 'layer']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		groups: React.PropTypes.array,
    layer: React.PropTypes.object,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      groups: [],
      layer: emptyLayer
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
         data: JSON.stringify({layer_id: _this.state.layer.layer_id}),
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
    var step1 = false, step2 = false, step3 = false, step4 = false; // step5 = false;
    switch(this.state.step){
      case 1:
        progressWidth = 'width-25';
        step1 = true;
        break;
      case 2:
        progressWidth = 'width-50';
        step2 = true;
        break;
      case 3:
        progressWidth = 'width-75';
        step3 = true;
        break;
      case 4:
        progressWidth = 'width-full';
        step4 = true;
        break;
    //  case 5:
    //    progressWidth = 'width-full';
    //    step5 = true;
    //    break;
      default:
      break;
    }
    var progressClassName = classNames('determinate', progressWidth);


		return (
      <div>
          <Header />
        <main>
          <div style={{marginLeft: '10px', marginRight: '10px'}}>
            <h4>{this.__('Create Layer')}</h4>
            <div className="row center">

              <b>{stepText}</b>

                <div className="progress">
                    <div className={progressClassName}></div>
                </div>
            </div>

            <Step1 groups={this.props.groups} active={step1} onSubmit={this.nextStep}/>
            <Step2 active={step2} showPrev={true} onPrev={this.prevStep} onSubmit={this.nextStep} />
            <Step3 active={step3} showPrev={true} onPrev={this.prevStep} onSubmit={this.nextStep} />
            <Step5 active={step4} showPrev={true} onPrev={this.prevStep} onSubmit={this.submit} />
          </div>
        </main>

      </div>
		);
	}
});

module.exports = CreateLayer;
