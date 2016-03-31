var React = require('react');

var Editor = require('react-medium-editor');
var ImageCrop = require('../ImageCrop');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HubBanner = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    editing: React.PropTypes.bool,
    subPage: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      editing: false,
      subPage: false
    };
  },

  getInitialState(){
    return {
      imageCropAspectRatio: 1,
      onCrop(){}
    };
  },

  handleTitleChange(title){
    HubActions.setTitle(title);
  },

  handleTaglineChange(tagline){
    HubActions.setTagline(tagline);
  },

  handleDescriptionChange(desc){
    HubActions.setDescription(desc);
  },

  showLogoEdit(){
    this.setState({imageCropAspectRatio: 1, onCrop: this.onLogoCrop});
    this.refs.imagecrop.show();
  },

  onLogoCrop(data){
    HubActions.setHubLogoImage(data);
  },

  showBannerEdit(){
    this.setState({imageCropAspectRatio: 16/9, onCrop: this.onBannerCrop});
    this.refs.imagecrop.show();
  },

  onBannerCrop(data){
    HubActions.setHubBannerImage(data);
  },

  render() {
    var bannerClass='hub-banner';
    if(this.props.subPage) {
      bannerClass='hub-banner-subpage';
    }
    var description = '', title = '', tagline = '',
    logoEditButton = '', bannerEditButton = '', imageCrop = '';
    if(this.props.editing){
      title = (
        <div className="white-text text-shadow hub-title">
          <Editor
           tag="h3"
           text={this.state.hub.name}
           onChange={this.handleTitleChange}
           options={{toolbar: false,
             placeholder: {text: this.__('Enter a Title for Your Hub')},
             disableReturn: true, buttons: []}}
         />
        </div>
      );
      tagline = (
        <div className="white-text text-shadow hub-tagline">
          <Editor
           tag="p"
           text={this.state.hub.tagline}
           onChange={this.handleTaglineChange}
           options={{toolbar: false,
             placeholder: {text: this.__('Enter a Tagline or Subheading for Your Hub')},
             disableReturn: true, buttons: []}}
         />
        </div>
      );
      description = (
        <div className="container">
          <div className="row">
            <div className="flow-text">
              <Editor
               tag="p"
               text={this.state.hub.description}
               onChange={this.handleDescriptionChange}
               options={{toolbar: false,
                 placeholder: {text: this.__('Enter a Description or Intro for Your Hub')},
                 disableReturn: true, buttons: []}}
             />
            </div>
          </div>
        </div>

      );
      logoEditButton = (
        <a className="btn-floating omh-color white-text" onClick={this.showLogoEdit}
          style={{position: 'absolute', top: '-15px', left: '85px'}}>
          <i className="material-icons">edit</i>
        </a>
      );

      bannerEditButton = (
        <a className="btn-floating omh-color white-text" onClick={this.showBannerEdit}
          style={{position: 'absolute', top: '205px', right: '10px'}}>
          <i className="material-icons">edit</i>
        </a>
      );
      imageCrop = (
        <ImageCrop ref="imagecrop" aspectRatio={this.state.imageCropAspectRatio} lockAspect={true} onCrop={this.state.onCrop} />
      );

    }else{
      title = (
        <h2 className="white-text text-shadow no-margin">{this.state.hub.name}</h2>
      );

      tagline = (
        <p className="white-text text-shadow no-margin">{this.state.hub.tagline}</p>
      );
      description = (
        <div className="container">
          <div className="row">
            <p className="flow-text hub-description">{this.state.hub.description}</p>
          </div>
        </div>

      );
    }
    var logoImage = '', bannerImage= '';
    if(this.state.logoImage){ //use new image first
      logoImage = (
        <a href="/">
          <img  alt={this.__('Hub Photo')} width="100" style={{borderRadius: '25px'}} src={this.state.logoImage} />
        </a>
      );
    } else if (this.state.hub.hasLogoImage) { //otherwise if there is an image from the server use that
      logoImage = (
        <a href="/">
          <img  alt={this.__('Hub Photo')} width="100" style={{borderRadius: '25px'}} src={'/hub/' + this.state.hub.hub_id + '/images/logo'} />
        </a>
      );
    }else{ //show placeholder
      logoImage = (
        <div className="center center-align valign-wrapper" style={{margin: 'auto', borderRadius: '25px', width: '100px', height: '100px',  borderStyle: 'dashed', borderColor:'#bdbdbd', borderWidth: '3px'}}>
          <i className="material-icons grey-text valign">add_a_photo</i>
          <p className="valign grey-text">{this.__('Add a Logo')}</p>
        </div>
      );
    }
    if(this.state.bannerImage){
      bannerImage = (<div className={bannerClass}
        style={{width: '100%', position: 'absolute', top: 0, backgroundImage: 'url('+this.state.bannerImage +')', backgroundSize: 'cover', backgroundPosition: 'center'}}/>);
    } else if (this.state.hub.hasBannerImage) {
      bannerImage = (<div className={bannerClass}
      style={{width: '100%', position: 'absolute', top: 0, backgroundImage: 'url("/hub/' + this.state.hub.hub_id + '/images/banner")', backgroundSize: 'cover', backgroundPosition: 'center'}}/>);
    } else{ //show placeholder
      bannerImage = (
        <div className="center center-align" style={{margin: 'auto', borderRadius: '25px', width: '100%', height: '100%', position: 'absolute', top: 0, borderColor:'#bdbdbd',  borderStyle: 'dashed', borderWidth: '3px'}}>
          <div className="center center-align valign-wrapper" style={{margin: 'auto', height: '100%', width: '200px'}}>
            <i className="material-icons grey-text valign">add_a_photo</i>
            <p className="valign grey-text">{this.__('Add a Banner Image')}</p>
          </div>

        </div>
      );
    }


    if(this.props.subPage){
      description = '';
    }

    return (
      <div>
        <div className={'row no-margin valign-wrapper ' + bannerClass} style={{position: 'relative'}}>
          {bannerImage}
          {bannerEditButton}
          <div className="row no-margin valign" style={{margin: 0, paddingLeft: '20px', width: '100%'}}>
            <div className="col s12 m1 l1 no-padding" style={{position: 'relative', minWidth: '110px'}}>
              {logoImage}
              {logoEditButton}
            </div>
            <div className="col s12 m9 l10 no-padding" style={{position: 'relative', marginTop: '20px'}}>
              {title}
              {tagline}
            </div>
          </div>
        </div>
        {description}
        {imageCrop}
      </div>
    );
  }

});

module.exports = HubBanner;
