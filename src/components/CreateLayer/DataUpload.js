import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');
var classNames = require('classnames');
var FileUpload = require('../forms/FileUpload');
var debug = require('../../services/debug')('DataUpload');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var DataUpload= React.createClass({

  mixins: [Formsy.Mixin, StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    layerId: PropTypes.string,
    className: PropTypes.string,
    dataTooltip: PropTypes.string,
    dataDelay: PropTypes.number,
    dataPosition: PropTypes.string
  },

  getInitialState() {
    return {
      value: ''
    };
  },

  getDefaultProps() {
    return {
      layerId: null
    };
  },

  changeValue(event) {
     this.setValue(event.currentTarget.value);
     this.setState({value: event.currentTarget.value});
   },

   onUpload(e){
     debug(e);
     //console.log(e.data);
   },
/*
  componentDidMount() {
    //run jquery materializecss stuff
  },
*/
  render() {
     var className = classNames( this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var url = "/api/layer/1/upload/shapefile";

    return (
      <div className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
           <FileUpload onMessage={this.onUpload} action={url}>
             <button type="submit" className="waves-effect waves-light btn">{this.__('Upload')}</button>
           </FileUpload>
      </div>
    );

  }
});

module.exports = DataUpload;
