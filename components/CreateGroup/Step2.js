var React = require('react');
var MessageActions = require('../../actions/MessageActions');
var NotificationActions = require('../../actions/NotificationActions');
var classNames = require('classnames');
var ImageCrop = require('../ImageCrop');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var GroupStore = require('../../stores/GroupStore');
var GroupActions = require('../../actions/GroupActions');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var CreateGroupStep2 = React.createClass({

  mixins:[StateMixin.connect(GroupStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func,
    active: React.PropTypes.bool.isRequired,
    showPrev: React.PropTypes.bool,
    onPrev: React.PropTypes.func
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
    };
  },

    submit () {
      this.props.onSubmit(this.state.group.group_id);
    },

    showImageCrop(){
      this.refs.imagecrop.show();
    },

    onCrop(data){
      var _this = this;
      //send data to server
      GroupActions.setGroupImage(data, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification(
            {
              message: _this.__('Image Saved'),
              position: 'bottomright',
              dismissAfter: 3000
          });
        }
      });
      //this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
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
          <button className="waves-effect waves-light btn" onClick={this.props.onPrev}>{this.__('Previous Step')}</button>
        </div>
      );
    }

    var groupImage = '';
    //if group has an image use link,
    if(this.state.group.hasImage){
      groupImage = (
            <img className="responsive-img" width={200} height={200} src={'/group/' + this.state.group.group_id + '/image?' + new Date().getTime()} />
      );
    }else{
    //else show default image
      groupImage = (
        <div className="circle valign-wrapper" style={{width: '200px', height: '200px'}}>
          <i className="material-icons" style={{fontSize: '100px', margin: 'auto'}}>group</i>
        </div>

      );
    }

		return (
      <div className={className}>
        <div className="container">
          <div className="row">
              <div className="col s12 m6 l6">
                  {groupImage}
              </div>
              <div className="col s12 m6 l6">
                <button className="waves-effect waves-light btn" onClick={this.showImageCrop}>{this.__('Add Image')}</button>
                <p>{this.__('Upload an Image or Logo for Your Group (Optional)')}</p>
              </div>

          </div>
          <div className="row">
            {prevButton}
            <div className="right">
                <button className="waves-effect waves-light btn" onClick={this.submit}>{this.__('Save')}</button>
            </div>
          </div>
         </div>
         <ImageCrop ref="imagecrop" aspectRatio={1} lockAspect={true} onCrop={this.onCrop} />
      </div>
		);
	}
});

module.exports = CreateGroupStep2;
