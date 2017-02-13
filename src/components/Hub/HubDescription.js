var React = require('react');

import Editor from 'react-medium-editor';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');


var HubDescription = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hubid: React.PropTypes.string.isRequired,
    editing: React.PropTypes.bool,
    subPage: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      editing: false,
      subPage: false
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

  handleDescriptionChange(desc){
    HubActions.setDescription(desc);
  },

  render() {   
    var description = '';
    var descriptionVal = null;
    if (this.state.hub.description) descriptionVal = this.state.hub.description.replace('&nbsp;', '');
    if(this.props.editing){      
      description = (
        <div className="container">
          <div className="row">
            <div className="flow-text">
              <Editor
               tag="p"
               text={descriptionVal}
               onChange={this.handleDescriptionChange}
               options={{toolbar: false, buttonLabels: false,
                 placeholder: {text: this.__('Enter a Description or Intro for Your Hub')},
                 disableReturn: true, buttons: []}}
             />
            </div>
          </div>
        </div>
      );
    }else{  
      description = (
        <div className="container">
          <div className="row">
            <p className="flow-text hub-description">{descriptionVal}</p>
          </div>
        </div>
      );
    }

    if(this.props.subPage){
      description = '';
    }

    return (
      <div>      
        {description}
      </div>
    );
  }

});

module.exports = HubDescription;
