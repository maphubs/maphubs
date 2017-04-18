import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');

var TextInput = require('../forms/textInput');

var classNames = require('classnames');

var GithubSource = React.createClass({

  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func
  },

  getDefaultProps() {
    return {
      onSubmit: null,
      active: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false
    }
  },

  enableButton () {
      this.setState({
        canSubmit: true
      });
    },
    disableButton () {
      this.setState({
        canSubmit: false
      });
    },

  submit (model) {
    //#TODO:180 save step 2 to DB
    this.props.onSubmit()
  },

  sourceChange(value){
    this.setState({selectedSource: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {

    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>Previous Step</a>
        </div>
      );
    }

		return (
        <div className={className}>
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>

            <div>
              <p>Github GeoJSON Source</p>
            <div className="row">
              <TextInput name="githuburl" label="Github GeoJSON URL" icon="info" className="col s12" validations="maxLength:100" validationErrors={{
                     maxLength: 'Must be 100 characters or less.'
                 }} length={100}
                 dataPosition="top" dataTooltip="Github GeoJSON URL"
                 required/>
            </div>
            </div>


            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>Save and Continue</button>
            </div>
          </Formsy.Form>


      </div>
		);
	}
});

module.exports = GithubSource;
