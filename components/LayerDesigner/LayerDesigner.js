var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var ColorPicker = require('react-colorpickr');
var ColorSwatch = require('./ColorSwatch');
var CodeEditor = require('./CodeEditor');
var LabelSettings = require('./LabelSettings');

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
    onLegendChange: React.PropTypes.func,
    color: React.PropTypes.string,
    style: React.PropTypes.object,
    labels: React.PropTypes.object,
    legendCode: React.PropTypes.string,
    layer: React.PropTypes.object,
    showAdvanced: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      color: 'red',
      style: null,
      labels: null,
      legendCode: null,
      layer: null,
      showAdvanced: true
    };
  },

  getInitialState(){
    return {
      color: this.props.color,
      style:this.props.style,
      labels:this.props.labels,
      legendCode: this.props.legendCode
    };
  },

  componentWillReceiveProps(nextProps){
    this.setState({
      style: nextProps.style,
      labels: nextProps.labels,
      legendCode: nextProps.legendCode
    });
  },

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.collapsible)).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  },

  onColorChange(color){
    this.setState({color});
    this.props.onColorChange(color);
  },

  onColorPickerChange(colorValue){
    var color = '#' + colorValue.hex;
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
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="#ffffcc"/>
               <ColorSwatch onClick={this.onColorChange} color="#fed976"/>
               <ColorSwatch onClick={this.onColorChange} color="#feb24c"/>
               <ColorSwatch onClick={this.onColorChange} color="#fd8d3c"/>
               <ColorSwatch onClick={this.onColorChange} color="#f03b20"/>
               <ColorSwatch onClick={this.onColorChange} color="#bd0026"/>
             </div>
             <div className="row no-margin">
               <ColorSwatch onClick={this.onColorChange} color="#a1dab4"/>
               <ColorSwatch onClick={this.onColorChange} color="#41b6c4"/>
               <ColorSwatch onClick={this.onColorChange} color="#2c7fb8"/>
               <ColorSwatch onClick={this.onColorChange} color="#253494"/>
               <ColorSwatch onClick={this.onColorChange} color="#ff5123"/>
               <ColorSwatch onClick={this.onColorChange} color="#994111"/>
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
         {advanced}

       </ul>
       <CodeEditor ref="styleEditor" id="layer-style-editor" mode={{name: "javascript", json: true}}
         code={JSON.stringify(this.state.style, undefined, 2)} title="Edit Layer Style" onSave={this.onStyleChange} />
       <CodeEditor ref="legendEditor" id="layer-legend-editor" mode={{name: "xml", htmlMode: true}}
           code={this.state.legendCode} title="Edit Layer Legend" onSave={this.onLegendChange} />
       </div>
    );
  }
});


module.exports = LayerDesigner;
