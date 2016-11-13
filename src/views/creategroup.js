var React = require('react');

var Header = require('../components/header');

var Step1 = require('../components/CreateGroup/Step1');
var Step2 = require('../components/CreateGroup/Step2');
var classNames = require('classnames');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateGroup = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
    };
  },

  getInitialState() {
    return {
      step: 1
    };
  },

    onComplete (group_id) {
      window.location = '/group/' + group_id;
    },

    nextStep () {
      this.setState({step: this.state.step + 1});
    },

    prevStep () {
      this.setState({step: this.state.step - 1});
    },

	render() {
    var stepText = this.__('Step') + ' ' + this.state.step;
    var progressWidth = '';
    var step1 = false, step2 = false;
    switch(this.state.step){
      case 1:
        progressWidth = 'width-50';
        step1 = true;
        break;
      case 2:
        progressWidth = 'width-full';
        step2 = true;
        break;
      default:
      break;
    }
    var progressClassName = classNames('determinate', progressWidth);

		return (
      <div>
          <Header />
        <div className="container">
          <h4>{this.__('Create Group')}</h4>
          <div className="row center">
            <b>{stepText}</b>

              <div className="progress">
                  <div className={progressClassName}></div>
              </div>
          </div>
          <Step1 active={step1} onSubmit={this.nextStep}/>
          <Step2 active={step2} showPrev={true} onPrev={this.prevStep} onSubmit={this.onComplete}/>
			</div>
      </div>
		);
	}
});

module.exports = CreateGroup;
