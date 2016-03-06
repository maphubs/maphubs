var React = require('react');

var Editor = require('react-medium-editor');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var FeatureNotesStore = require('../../stores/FeatureNotesStore');
var FeatureNotesActions = require('../../actions/FeatureNotesActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var FeatureNotes = React.createClass({

  mixins:[StateMixin.connect(FeatureNotesStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    editing: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      editing: false
    };
  },

  handleNotesChange(notes){
    FeatureNotesActions.setNotes(notes);
  },

  render(){
    var resources = '';
    if(this.props.editing){
      resources = (
          <div className="row">
              <Editor
               className="feature-notes"
               text={this.state.notes}
               onChange={this.handleNotesChange}
               options={{
                 buttonLabels: 'fontawesome',
                 delay: 100,
                 placeholder: {text: this.__('Enter text, links to webpages, links to documents (from Dropbox, Google Docs, etc.)')},
                 buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']
               }}
             />
          </div>

      );
    }else{
      /*eslint-disable react/no-danger*/
      resources = (
            <div className="feature-notes-content col s12 no-padding" dangerouslySetInnerHTML={{__html: this.state.notes}}></div>
      );
      /*eslint-enable react/no-danger*/
    }

    return (
      <div className="row" style={{marginLeft: '0px'}}>
        {resources}
      </div>
    );
  }

});
module.exports = FeatureNotes;
