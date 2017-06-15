//@flow
import React from 'react';
var $ = require('jquery');
import CodeEditor from './CodeEditor';
import AdvancedLayerSettings from './AdvancedLayerSettings';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  onChange: Function,
  value: number,
  onStyleChange: Function,
  onLegendChange: Function,
  onSettingsChange: Function,
  style: Object,
  legendCode: string,
  layer: Object,
  settings: Object,
  showAdvanced: boolean
|}

type DefaultProps = {
  value: number,
  settings: Object
}

type State = {
  opacity: number,
  style: Object,
  legendCode: string,
  settings: Object
}

export default class OpacityChooser extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    value: 100,
    settings: {}
  }

  constructor(props: Props){
    super(props);
    this.state = {
      opacity: props.value,
      style: props.style,
      legendCode: props.legendCode,
      settings: props.settings
    };
  }

  componentDidMount() {
    $(this.refs.collapsible).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  }

  componentWillReceiveProps(nextProps: Props){
    this.setState({
      style: nextProps.style,
      legendCode: nextProps.legendCode,
      settings: nextProps.settings
    });
  }

  onChange = (e: any) => {
    var opacity = e.target.valueAsNumber;
    this.setState({opacity});
    this.props.onChange(opacity);
  }

  onStyleChange = (style: string) => {
    style = JSON.parse(style);
    this.setState({style});
    this.props.onStyleChange(style);
  }

  onSettingsChange = (style: Object, settings: Object) => {
    this.setState({style, settings});
    this.props.onSettingsChange(style, settings);
  }

  onLegendChange = (legendCode: string) => {
    this.setState({legendCode});
    this.props.onLegendChange(legendCode);
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
            <button onClick={this.showStyleEditor} className="btn" style={{margin: '10px'}}>{this.__('Edit Style Code')}</button>
            <br />
            <button onClick={this.showLegendEditor} className="btn" style={{marginBottom: '10px'}}>{this.__('Edit Legend Code')}</button>
              <AdvancedLayerSettings layer={this.props.layer} style={this.state.style} settings={this.state.settings} onChange={this.onSettingsChange}/>
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
         code={JSON.stringify(this.state.style, undefined, 2)} title="Edit Layer Style" onSave={this.onStyleChange} />
       <CodeEditor ref="legendEditor" id="raster-legend-editor" mode="html"
           code={this.state.legendCode} title="Edit Layer Legend" onSave={this.onLegendChange} />
      </div>
    );
  }
}