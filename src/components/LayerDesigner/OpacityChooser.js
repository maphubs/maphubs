//@flow
import React from 'react';
var $ = require('jquery');
import CodeEditor from './CodeEditor';
import AdvancedLayerSettings from './AdvancedLayerSettings';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';

type Props = {|
  onChange: Function,
  value: number,
  onStyleChange: Function,
  onLegendChange: Function,
  onColorChange: Function,
  style: Object,
  legendCode: string,
  layer: Object,
  showAdvanced: boolean
|}

type DefaultProps = {
  value: number
}

type State = {
  opacity: number
}

export default class OpacityChooser extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    value: 100
  }

  constructor(props: Props){
    super(props);
    this.state = {
      opacity: props.value,
      style: props.style,
      legendCode: props.legendCode
    };
  }

  componentDidMount() {
    $(this.refs.collapsible).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
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

  onChange = (e: any) => {
    var opacity = e.target.valueAsNumber;
    this.setState({opacity});
    this.props.onChange(opacity);
  }

  onStyleChange = (style: Object) => {
    this.props.onStyleChange(style);
  }

  onCodeStyleChange = (style: string) => {
    style = JSON.parse(style);
    this.props.onStyleChange(style);
  }
  onLegendChange = (legendCode: string) => {
    this.props.onLegendChange(legendCode);
  }

  onAdvancedSettingsChange = (style: GLStyle, legend: string) => {
    this.props.onColorChange(style, legend);
  }

  showStyleEditor = () => {
    this.refs.styleEditor.show();
  }

  showLegendEditor = () => {
    this.refs.legendEditor.show();
  }

  render(){
     var advanced = '';
    if(this.props.showAdvanced){
      advanced = (
        <li>
          <div className="collapsible-header">
            <i className="material-icons">code</i>{this.__('Advanced')}
            </div>
          <div className="collapsible-body">
            <AdvancedLayerSettings layer={this.props.layer} style={this.props.style} onChange={this.onAdvancedSettingsChange}/>
            <div className="row">
              <div className="col s12, m6">
                <button onClick={this.showStyleEditor} className="btn">{this.__('Style')}</button>
              </div>
              <div className="col s12, m6">
                <button onClick={this.showLegendEditor} className="btn">{this.__('Legend')}</button>
              </div>
            </div>
          </div>
        </li>
      );
    }
    return (
      <div>
      <ul ref="collapsible" className="collapsible" data-collapsible="accordion">
      <li>
           <div className="collapsible-header active">
               <i className="material-icons">opacity</i>{this.__('Opacity')}
           </div>
           <div className="collapsible-body">
              <div className="row">
                <form action="#">
                <p className="range-field">
                  <input type="range" id="opacity" min="0" max="100" value={this.state.opacity} onChange={this.onChange}/>
                </p>
              </form>
              </div>
              <div className="row valign-wrapper">
              <h5 className="valign" style={{margin: 'auto'}}>
                {this.state.opacity}%
              </h5>
            </div>
          </div>
          </li>
         {advanced}

       </ul>
        <CodeEditor ref="styleEditor" id="raster-style-editor" mode="json"
         code={JSON.stringify(this.props.style, undefined, 2)} title="Edit Layer Style" onSave={this.onCodeStyleChange} />
       <CodeEditor ref="legendEditor" id="raster-legend-editor" mode="html"
           code={this.props.legendCode} title="Edit Layer Legend" onSave={this.onLegendChange} />
      </div>
    );
  }
}