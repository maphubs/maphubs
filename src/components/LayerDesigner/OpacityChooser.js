import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var CodeEditor = require('./CodeEditor');
import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var AdvancedLayerSettings = require('./AdvancedLayerSettings');

var OpacityChooser = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number,
    onStyleChange: PropTypes.func,
    onLegendChange: PropTypes.func,
    onSettingsChange: PropTypes.func,
    style: PropTypes.object,
    legendCode: PropTypes.string,
    layer: PropTypes.object,
    settings: PropTypes.object,
    showAdvanced: PropTypes.bool
  },

  getDefaultProps(){
    return {
      value: 100,
      settings: {}
    };
  },

  getInitialState(){
    return {
      opacity: this.props.value,
      style:this.props.style,
      legendCode: this.props.legendCode,
      settings: this.props.settings
    };
  },

  componentDidMount() {
    $(this.refs.collapsible).collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  },

  componentWillReceiveProps(nextProps){
    this.setState({
      style: nextProps.style,
      legendCode: nextProps.legendCode,
      settings: nextProps.settings
    });
  },

  onChange(e){
    var opacity = e.target.valueAsNumber;
    this.setState({opacity});
    this.props.onChange(opacity);
  },

  onStyleChange(style){
    style = JSON.parse(style);
    this.setState({style});
    this.props.onStyleChange(style);
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
});

module.exports = OpacityChooser;
