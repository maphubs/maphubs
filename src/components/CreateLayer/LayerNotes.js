import React from 'react';
import PropTypes from 'prop-types';

import Editor from 'react-medium-editor';

import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerNotesStore = require('../../stores/LayerNotesStore');
var LayerNotesActions = require('../../actions/LayerNotesActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var LayerNotes = React.createClass({

  mixins:[StateMixin.connect(LayerNotesStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    editing: PropTypes.bool
  },

  getDefaultProps(){
    return {
      editing: false
    };
  },

  handleNotesChange(notes){
    LayerNotesActions.setNotes(notes);
  },

  render(){
    var resources = '';
    if(this.props.editing){
      resources = (
          <div className="row no-margin"  style={{height: '100%', overflow: 'auto'}}>
              <Editor
               className="notes-content"
               text={this.state.notes}
               onChange={this.handleNotesChange}
               options={{
                 buttonLabels: 'fontawesome',
                 delay: 100,
                 placeholder: {text: this.__('Enter text, links to webpages, links to documents (from Dropbox, Google Docs, etc.)')},
                 toobar:{
                   buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']
                 },
                 paste: {
                   forcePlainText: false,
                   cleanPastedHTML: true
                 },
                  autoLink: true,
                  imageDragging: false
               }}
             />
          </div>

      );
    }else{
      /*eslint-disable react/no-danger*/
      resources = (
            <div className="notes-content col s12 no-padding" style={{height: '100%', overflow: 'auto'}} dangerouslySetInnerHTML={{__html: this.state.notes}}></div>
      );
      /*eslint-enable react/no-danger*/
    }

    return (
      <div className="row no-margin" style={{marginLeft: '0px', height: 'calc(100% - 25px)'}}>
        {resources}
      </div>
    );
  }

});
module.exports = LayerNotes;
