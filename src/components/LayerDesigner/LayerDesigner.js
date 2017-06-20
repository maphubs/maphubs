//@flow
import React from 'react';
var $ = require('jquery');
import ColorPicker from 'react-colorpickr';
import ColorSwatch from './ColorSwatch';
import CodeEditor from './CodeEditor';
import LabelSettings from './LabelSettings';
import MarkerSettings from './MarkerSettings';
import AdvancedLayerSettings from './AdvancedLayerSettings';
import MapHubsComponent from '../MapHubsComponent';
import MapStyles from '../Map/Styles';

import type {GLStyle} from '../../types/mapbox-gl-style';

type ColorValue = {r: number, g: number, b: number, a: number}

type Props = {|
  onColorChange: Function,
  onStyleChange: Function,
  onLabelsChange: Function,
  onMarkersChange: Function,
  onLegendChange: Function,
  alpha: number,
  style: Object,
  labels: Object,
  legend: string,
  layer: Object,
  showAdvanced: boolean
|}

type DefaultProps = {
  alpha: number,
  showAdvanced: boolean
}

type State = {
  color: string,
  markers?: Object
}

export default class LayerDesigner extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    alpha: 0.5,
    showAdvanced: true
  }
  
  constructor(props: Props){
    super(props);
    let color = this.getColorFromStyle(props.style);
    this.state = {
      color
    };
  }

  componentWillReceiveProps(nextProps: Props){
    let color = this.getColorFromStyle(nextProps.style);
    this.setState({
      color
    });
  }

  componentDidMount() {
    $(this.refs.collapsible).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  }

  getColorFromStyle = (style: GLStyle): string => {
    let color = 'rgba(255,0,0,0.65)';
    let prevColor = MapStyles.settings.get(style, 'color');
    if(prevColor){
      color = prevColor;
    }
    return color;
  }

  setColorInStyle = (style: GLStyle, color: string):GLStyle  => {
    style = MapStyles.settings.set(style, 'color', color);
    return style;
  }

  onColorChange = (color: string) => {
    let style = this.setColorInStyle(this.props.style, color);
    style = MapStyles.color.updateStyleColor(style, color);
    let legend = MapStyles.legend.legendWithColor(this.props.layer, color);
    this.setState({color});
    this.props.onColorChange(style, legend);
  }

  onColorPickerChange = (colorValue: ColorValue) => {
    let color = `rgba(${colorValue.r},${colorValue.g},${colorValue.b},${colorValue.a})`;
    this.onColorChange(color);
  }

  onStyleChange = (style: string) => {
    style = JSON.parse(style);
    this.props.onStyleChange(style);
  }

  onLabelsChange = (style: GLStyle, labels: Object) => {
    this.props.onLabelsChange(style, labels);
  }

  onMarkersChange = (style: GLStyle, markers: Object) => {
    this.props.onMarkersChange(style, markers);
  }

  onLegendChange = (legend: string) => {
    this.props.onLegendChange(legend);
  }

  showStyleEditor = () => {
    this.refs.styleEditor.show();
  }

  showLegendEditor = () => {
    this.refs.legendEditor.show();
  }

  render(){
    var markers = '';
    if(this.props.layer.data_type === 'point'){
      markers = (
        <li>
           <div className="collapsible-header">
             <i className="material-icons">place</i>{this.__('Markers')}
             </div>
           <div className="collapsible-body">
             <MarkerSettings onChange={this.onMarkersChange} style={this.props.style} layer={this.props.layer} />
           </div>
         </li>
      );
    }

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
            <AdvancedLayerSettings layer={this.props.layer} style={this.props.style} onChange={this.onStyleChange}/>
          </div>
        </li>
      );
    }

    return (
      <div>
      <ul ref="collapsible" className="collapsible" data-collapsible="accordion">
         <li>
           <div className="collapsible-header active">
               <i className="material-icons">color_lens</i>{this.__('Colors')}
           </div>
           <div className="collapsible-body"> 
             <div className="row no-margin" style={{height: '170px', overflowY: 'auto', backgroundColor: 'rgba(240,240,239,1)'}}>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="rgba(255, 255, 204, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(254, 217, 118, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(254, 178, 76, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(252, 140, 59, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(240, 59, 32, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(255, 81, 34, 0.65)"/>
             </div>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="rgba(240,194,194, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(226,133,133, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(217,93,93, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(208,53,53, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(189, 0, 38, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(145,37,37, 0.65)"/>
             </div>
             <div className="row no-margin">
                <ColorSwatch onClick={this.onColorChange} color="rgba(240,247,218, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(161, 218, 180, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(201,223,138, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(119,171,89, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(54,128,45, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(35,77,32, 0.65)"/>
             </div>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="rgba(131, 219, 232, 0.65)"/>
                <ColorSwatch onClick={this.onColorChange} color="rgba(25,179,202, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(102,204,204, 0.65)"/>
                 <ColorSwatch onClick={this.onColorChange} color="rgba(44, 127, 184, 0.65)"/>
                 <ColorSwatch onClick={this.onColorChange} color="rgba(49,105,138, 0.65)"/>
                 <ColorSwatch onClick={this.onColorChange} color="rgba(37, 52, 148, 0.65)"/>
             </div>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="rgba(214,140,255, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(191,78,255, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(163,0,255, 0.65)"/>
                 <ColorSwatch onClick={this.onColorChange} color="rgba(116,0,182, 0.65)"/>
                 <ColorSwatch onClick={this.onColorChange} color="rgba(85,0,133, 0.65)"/>
                  <ColorSwatch onClick={this.onColorChange} color="rgba(240,21,231, 0.65)"/>
             </div>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="rgba(161,93,26, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(151,84,32, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(126,77,30, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(118,69,20, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(87,51,15, 0.65)"/>
               <ColorSwatch onClick={this.onColorChange} color="rgba(153, 65, 17, 0.65)"/>
             </div>
           </div>
           </div>
         </li>
         <li>
           <div className="collapsible-header">
             <i className="material-icons">expand_more</i>{this.__('More Colors')}
             </div>
           <div className="collapsible-body">
             <ColorPicker onChange={this.onColorPickerChange} value={this.state.color} />
           </div>
         </li>
         <li>
           <div className="collapsible-header">
             <i className="material-icons">label</i>{this.__('Labels')}
             </div>
           <div className="collapsible-body">
             <LabelSettings onChange={this.onLabelsChange} style={this.props.style} labels={this.props.labels} layer={this.props.layer} />
           </div>
         </li>
         {markers}
         {advanced}

       </ul>
       <CodeEditor ref="styleEditor" id="layer-style-editor" mode="json"
         code={JSON.stringify(this.props.style, undefined, 2)} title={this.__('Editing Layer Style')} onSave={this.onStyleChange} />
       <CodeEditor ref="legendEditor" id="layer-legend-editor" mode="html"
           code={this.props.legend} title={this.__('Edit Layer Legend')} onSave={this.onLegendChange} />
       </div>
    );
  }
}