var React = require('react');
var $ = require('jquery');
var ColorPicker = require('react-colorpickr');
var ColorSwatch = require('./ColorSwatch');
var CodeEditor = require('./CodeEditor');
var LabelSettings = require('./LabelSettings');
var MarkerSettings = require('./MarkerSettings');
var AdvancedLayerSettings = require('./AdvancedLayerSettings');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var LayerDesigner = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onColorChange: React.PropTypes.func,
    onStyleChange: React.PropTypes.func,
    onLabelsChange: React.PropTypes.func,
    onMarkersChange: React.PropTypes.func,
    onLegendChange: React.PropTypes.func,
    onSettingsChange: React.PropTypes.func,
    color: React.PropTypes.string,
    style: React.PropTypes.object,
    labels: React.PropTypes.object,
    legendCode: React.PropTypes.string,
    layer: React.PropTypes.object,
    showAdvanced: React.PropTypes.bool,
    settings: React.PropTypes.object,
  },

  getDefaultProps(){
    return {
      color: 'red',
      alpha: 0.5,
      style: null,
      labels: null,
      legendCode: null,
      layer: null,
      settings: {},
      showAdvanced: true
    };
  },

  getInitialState(){
    return {
      color: this.props.color,
      style:this.props.style,
      labels:this.props.labels,
      legendCode: this.props.legendCode,
      settings: this.props.settings
    };
  },

  componentWillReceiveProps(nextProps){
    this.setState({
      color: nextProps.color,
      style: nextProps.style,
      labels: nextProps.labels,
      legendCode: nextProps.legendCode,
      settings: nextProps.settings ? nextProps.settings : this.state.settings
    });
  },

  componentDidMount() {
    $(this.refs.collapsible).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  },

  onColorChange(color){
    var settings = {};
    if(this.state.settings){
      settings = this.state.settings;
    }

    settings.color = color;
    this.setState({color, settings});
    this.props.onColorChange(color, settings);
  },

  onColorPickerChange(colorValue){
    let color = `rgba(${colorValue.r},${colorValue.g},${colorValue.b},${colorValue.a})`;
    this.setState({color});
    this.props.onColorChange(color);
  },

  onStyleChange(style){
    //TODO: verify JSON for syntax, check for valid style components
    style = JSON.parse(style);
    this.setState({style});
    this.props.onStyleChange(style);
  },

  onLabelsChange(style, labels){
    this.setState({style, labels});
    this.props.onLabelsChange(style, labels);
  },

  onMarkersChange(style, markers){
    this.setState({style, markers});
    this.props.onMarkersChange(style, markers);
  },

  onSettingsChange(style, settings){
    this.setState({style, settings});
    this.props.onSettingsChange(style, settings);
  },

  onLegendChange(legendCode){
    this.setState({legendCode});
    this.props.onLegendChange(legendCode);
  },

  showStyleEditor(){
    this.refs.styleEditor.show();
  },

  showLegendEditor(){
    this.refs.legendEditor.show();
  },

  render(){
    var markers = '';
    if(this.props.layer.data_type === 'point'){
      markers = (
        <li>
           <div className="collapsible-header">
             <i className="material-icons">place</i>{this.__('Markers')}
             </div>
           <div className="collapsible-body">
             <MarkerSettings onChange={this.onMarkersChange} style={this.state.style} layer={this.props.layer} />
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
             <LabelSettings onChange={this.onLabelsChange} style={this.state.style} labels={this.state.labels} layer={this.props.layer} />
           </div>
         </li>
         {markers}
         {advanced}

       </ul>
       <CodeEditor ref="styleEditor" id="layer-style-editor" mode="json"
         code={JSON.stringify(this.state.style, undefined, 2)} title={this.__('Editing Layer Style')} onSave={this.onStyleChange} />
       <CodeEditor ref="legendEditor" id="layer-legend-editor" mode="html"
           code={this.state.legendCode} title={this.__('Edit Layer Legend')} onSave={this.onLegendChange} />
       </div>
    );
  }
});


module.exports = LayerDesigner;
