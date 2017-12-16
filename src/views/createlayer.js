//@flow
import React from 'react';
const $ = require('jquery');
const classNames = require('classnames');
import slugify from 'slugify';

import Header from '../components/header';
import Step1 from '../components/CreateLayer/Step1';
import Step2 from '../components/CreateLayer/Step2';
import Step5 from '../components/CreateLayer/Step5';

import debugFactory from '../services/debug';
const debug = debugFactory('CreateLayer');

import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import LayerStore from '../stores/layer-store';
import BaseMapStore from '../stores/map/BaseMapStore';
import type {Group} from '../stores/GroupStore';
import type {Layer, LayerStoreState} from '../stores/layer-store';
import type {LocaleStoreState} from '../stores/LocaleStore';
import ErrorBoundary from '../components/ErrorBoundary';

type Props = {
  groups: Array<Group>,
  layer: Layer,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object
}

type DefaultProps = {
   groups: Array<Group>
}

type State = {
  step: number
} & LayerStoreState & LocaleStoreState

export default class CreateLayer extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    groups: []
  }

  state: State = {
    step: 1
  }

  constructor(props: Props){
		super(props);
    this.stores.push(LayerStore);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
   
    Reflux.rehydrate(LayerStore, this.props.layer);
	}

  componentDidMount(){
    const _this = this;

    window.onunload = function(){
      if(_this.state.layer_id && _this.state.layer_id !== -1 && !_this.state.complete){
        $.ajax({
         type: "POST",
         url: '/api/layer/admin/delete',
         contentType : 'application/json;charset=UTF-8',
         dataType: 'json',
         data: JSON.stringify({layer_id: _this.state.layer_id, _csrf: _this.state._csrf}),
          async: false,
          success(){

          },
          error(msg){
            debug.log(msg);
          }
        });
      }
    };

    window.onbeforeunload = function(){
      if(_this.state.layer_id && _this.state.layer_id !== -1 && !_this.state.complete){
        return _this.__('You have not finished creating your layer, if you leave now your layer will be deleted.');
      }else if (!_this.state.layer_id || _this.state.layer_id === -1) {
        return _this.__('You have not finished creating your layer.');
      }
    };
  }

  submit = (layer_id: number, name: LocalizedString) => {
      window.location = '/layer/info/' + layer_id + '/' + slugify(this._o_(name));
  }

  nextStep = () => {
    this.setState({step: this.state.step + 1});
  }

  prevStep = () => {
    this.setState({step: this.state.step - 1});
  }

	render() {

    if(!this.props.groups || this.props.groups.length === 0){
      return (
        <div>
            <Header {...this.props.headerConfig}/>
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

    const stepText = this.__('Step') + ' ' + this.state.step;
    let progressWidth = '';

    const progressClassName = classNames('determinate', progressWidth);
    let step1 = '';
    if(this.state.step === 1){
      progressWidth = 'width-25';
      step1 = (
        <Step1 onSubmit={this.nextStep} mapConfig={this.props.mapConfig}/>
      );
    }
    let step2 = '';
    if(this.state.step === 2){
       progressWidth = 'width-50';
      step2 = (
        <Step2  groups={this.props.groups} showPrev={true} onPrev={this.prevStep} onSubmit={this.nextStep} />
      );
    }
    let step3 = '';
    if(this.state.step === 3){
       progressWidth = 'width-75';
      step3 = (
        <Step5 onPrev={this.prevStep} onSubmit={this.submit} mapConfig={this.props.mapConfig} />         
      );
    }

		return (
      <ErrorBoundary>
          <Header {...this.props.headerConfig}/>
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

      </ErrorBoundary>
		);
	}
}