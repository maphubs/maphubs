//@flow
import React from 'react';
import TextInput from './textInput';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';
const $ = require('jquery');

type Props = {
  id: string,
  value?: LocalizedString,
  label: LocalizedString,
  length: number,
  successText: string,
  disabled: boolean,
  className?: string,
  dataTooltip?: string,
  dataDelay?: number,
  dataPosition?: string,
  name: string,
  required: boolean,
  placeholder?: string,
  type: string,
  style: Object,
  showCharCount: boolean,
  useMaterialize: boolean,
  onClick?: Function,
  validations: string,
  validationErrors: Object
}

type DefaultProps = {
  length: number,
  successText: string,
  disabled: boolean,
  dataDelay: number,
  type: string,
  style: Object,
  showCharCount: boolean,
  useMaterialize: boolean,
  validations: string,
  validationErrors: Object
}

type State = {
  value: LocalizedString
}

export default class MultiTextInput extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps  = {
      length: 100,
      successText: '',
      disabled: false,
      dataDelay: 100,
      type: 'text',
      style: {},
      showCharCount: true,
      useMaterialize: true,
      validations: '',
      validationErrors: {}
  }

  state: State

  constructor(props: Props) {
    super(props);
    let value: LocalizedString = {en: '', fr: '', es: '', it: ''};
    if(typeof props.value === 'string'){
      value['en'] = props.value;
    }else if(props.value){
      value = props.value;
    }
    this.state = {
      value
    };
  }

  componentDidMount(){
    $(this.refs.tabs).tabs();
  }

  componentWillReceiveProps(nextProps: Props) {
    if(!_isequal(this.props.value, nextProps.value)){
      if(nextProps.value){
        this.setState({
          value: nextProps.value
        });
      }else{
        this.setState({
          value: {en: '', fr: '', es: '', it: ''}
        });
      }    
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }  

  changeValue = (model: Object) => {  
    this.setState({
      value: model
    });
  }


render(){

  const commonProps = {
    length: this.props.length,
    showCharCount: this.props.showCharCount,
    dataPosition: this.props.dataPosition,
    dataTooltip: this.props.dataTooltip,
    dataDelay: this.props.dataDelay,
    validations: this.props.validations,
    validationErrors: this.props.validationErrors,
    successText: this.props.successText
  };

   let id = '';
   if(this.props.id){
     id = this.props.id;
   }else {
     id = this.props.name;
   }

   let tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

  return (
    <div className="row">
     <div className="col s12 no-padding">
       <ul ref="tabs" className="tabs">
          <li className="tab"><a className="active" href={`#${id}-en`}>EN</a></li>
          <li className="tab"><a href={`#${id}-fr`}>FR</a></li>
          <li className="tab"><a href={`#${id}-es`}>ES</a></li>
          <li className="tab"><a href={`#${id}-it`}>IT</a></li>
       </ul>
     </div>
            
     <div className="col s12" id={`${id}-en`}>
        <TextInput 
          name={`${this.props.name}-en`}
          value={this.state.value['en']}
          label={this.props.label['en']}
          className="col s12" 
          required={this.props.required}
          {...commonProps}   
          />
     </div>
      <div className="col s12" id={`${id}-fr`} style={{display: tabContentDisplay}}>
        <TextInput 
          name={`${this.props.name}-fr`}
          value={this.state.value['fr']}
          label={this.props.label['fr']}
          className="col s12" 
          {...commonProps}   
          />
      </div>
      <div className="col s12" id={`${id}-es`} style={{display: tabContentDisplay}}>
        <TextInput 
          name={`${this.props.name}-es`}
          value={this.state.value['es']}
          label={this.props.label['es']}
          className="col s12" 
          {...commonProps}   
          />
      </div>
      <div className="col s12" id={`${id}-it`} style={{display: tabContentDisplay}}>
        <TextInput 
          name={`${this.props.name}-it`}        
          value={this.state.value['it']}
          label={this.props.label['it']}
          className="col s12" 
          {...commonProps}   
          />
      </div>
    </div>
  );
}

}