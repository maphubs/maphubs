//@flow
import React from 'react';
import Editor from 'react-medium-editor';
import ImageCrop from '../ImageCrop';
import HubStore from '../../stores/HubStore';
import HubActions from '../../actions/HubActions';
import MapHubsPureComponent from '../../components/MapHubsPureComponent';
//import _isequal from 'lodash.isequal';
import urlUtil from '../../services/url-util';
import type {HubStoreState} from '../../stores/HubStore';

type Props = {
  hubid: string,
  editing: boolean,
  subPage: boolean
}

type State = {
  imageCropAspectRatio: number,
  imageCropResizeWidth: number,
  imageCropResizeMaxWidth: number,
  imageCropResizeHeight: number,
  onCrop: Function
} & HubStoreState

export default class HubBanner extends MapHubsPureComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    editing: false,
    subPage: false
  }

  state: State = {
    imageCropAspectRatio: 1,
    imageCropResizeWidth: 0,
    imageCropResizeMaxWidth: 0,
    imageCropResizeHeight: 0,
    onCrop(){},
    hub: {}
  }

  constructor(props: Props){
		super(props);
    this.stores.push(HubStore);
	}

/*
  shouldComponentUpdate(nextProps: Object, nextState: Object){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }
  */

  handleTitleChange = (title: string) => {
    HubActions.setTitle(title);
  }

  handleTaglineChange = (tagline: string) => {
    HubActions.setTagline(tagline);
  }

  showLogoEdit = () => {
    this.setState({
      imageCropAspectRatio: 1,
      imageCropResizeWidth: 300,
      imageCropResizeHeight: 300,
      imageCropResizeMaxWidth: null,
      onCrop: this.onLogoCrop});
    this.refs.imagecrop.show();
  }

  onLogoCrop = (data: Object, info: Object) => {
    HubActions.setHubLogoImage(data, info);
  }

  showBannerEdit = () => {
    this.setState({
      imageCropAspectRatio: 4/1,
      imageCropResizeMaxWidth: 2000,
      imageCropResizeWidth: null,
      imageCropResizeHeight: null,
      onCrop: this.onBannerCrop
    });
    this.refs.imagecrop.show();
  }

  onBannerCrop = (data: Object, info: Object) => {
    HubActions.setHubBannerImage(data, info);
  }

  render() {
    var omhBaseUrl = urlUtil.getBaseUrl();

    var hubBaseUrl = omhBaseUrl + '/hub/' + this.props.hubid;
    var bannerClass='hub-banner';
    if(this.props.subPage) {
      bannerClass='hub-banner-subpage';
    }
    var title = '', tagline = '',
    logoEditButton = '', bannerEditButton = '', imageCrop = '';

    var nameVal = null;
    if(this.state.hub.name) nameVal = this.state.hub.name.replace('&nbsp;', '');
    var taglineVal = null;
    if(this.state.hub.tagline) taglineVal = this.state.hub.tagline.replace('&nbsp;', '');

    if(this.props.editing){
      title = (
        <div className="white-text text-shadow hub-title">
          <Editor
           tag="h2"
           text={nameVal}
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
           text={taglineVal}
           onChange={this.handleTaglineChange}
           options={{toolbar: false, buttonLabels: false,
             placeholder: {text: this.__('Enter a Tagline or Subheading for Your Hub')},
             disableReturn: true, buttons: []}}
         />
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
        <ImageCrop ref="imagecrop"
          aspectRatio={this.state.imageCropAspectRatio} lockAspect={true}
          resize_max_width={this.state.imageCropResizeMaxWidth}
          resize_width={this.state.imageCropResizeWidth}
          resize_height={this.state.imageCropResizeHeight}
          onCrop={this.state.onCrop} />
      );

    }else{
      title = (
        <h2 className="white-text text-shadow no-margin">{nameVal}</h2>
      );

      tagline = (
        <p className="white-text text-shadow no-margin">{taglineVal}</p>
      );
    }
    var logoImage = '', bannerImage= '';
    if(this.state.logoImage){ //use new image first
      logoImage = (
        <a href={hubBaseUrl}>
          <img  alt={this.__('Hub Photo')} width="100" style={{borderRadius: '25px'}} src={this.state.logoImage} />
        </a>
      );
    } else if (this.state.hub.hasLogoImage) { //otherwise if there is an image from the server use that
      logoImage = (
        <a href={hubBaseUrl}>
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
        {imageCrop}
      </div>
    );
  }
}