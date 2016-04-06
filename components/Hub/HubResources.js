var React = require('react');

var Editor = require('react-medium-editor');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');

var HubResources = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

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

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

  handleResourcesChange(resources){
    HubActions.setResources(resources);
  },

  render(){
    var resources = '';
    if(this.props.editing){
      resources = (
          <div className="row">
              <Editor
               className="hub-resources"
               text={this.state.hub.resources}
               onChange={this.handleResourcesChange}
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
            <div className="resource-content col s12" dangerouslySetInnerHTML={{__html: this.state.hub.resources}}></div>
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
module.exports = HubResources;
