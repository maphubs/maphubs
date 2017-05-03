//@flow
import React from 'react';
import Header from '../components/header';
import Step1 from '../components/CreateGroup/Step1';
import Step2 from '../components/CreateGroup/Step2';
import classNames from 'classnames';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class CreateGroup extends MapHubsComponent {

  props: {
    locale: string,
    _csrf: string,
    headerConfig: Object
  }

  state = {
    step: 1
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  onComplete = (group_id: string) => {
    window.location = '/group/' + group_id;
  }

  nextStep = () => {
    this.setState({step: this.state.step + 1});
  }

  prevStep = () => {
    this.setState({step: this.state.step - 1});
  }

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
          <Header {...this.props.headerConfig}/>
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
}