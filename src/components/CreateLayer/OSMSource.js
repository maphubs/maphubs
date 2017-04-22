import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');
var $ = require('jquery');


var classNames = require('classnames');

var OSMSource = React.createClass({

  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func
  },

  static defaultProps: {
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
    //#TODO:170 save step 2 to DB
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

            <h4>Coming Soon!</h4>


            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>Save and Continue</button>
            </div>
          </Formsy.Form>

      </div>
		);
	}
});

module.exports = OSMSource;
