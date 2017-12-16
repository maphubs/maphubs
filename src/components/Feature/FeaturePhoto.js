//  @flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';
import ImageCrop from '../ImageCrop';
import MessageActions from '../../actions/MessageActions';
import NotificationActions from '../../actions/NotificationActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
import FeaturePhotoActions from '../../actions/FeaturePhotoActions';

type Props = {
  photo?: Object
}

export default class FeatureExport extends MapHubsPureComponent<Props, void> {
  showImageCrop = () => {
    this.refs.imagecrop.show();
  }

  onCrop = (data: Object, info: Object) => {
    const _this = this;
    //send data to server
    FeaturePhotoActions.addPhoto(data, info, this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification(
          {
            message: _this.__('Image Saved'),
            position: 'bottomright',
            dismissAfter: 3000,
            onDismiss(){
              location.reload();
            }
        });
      }
    });
  }

  deletePhoto = () => {
    const _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Removal'),
      message: _this.__('Are you sure you want to remove this photo?'),
      onPositiveResponse(){
        FeaturePhotoActions.removePhoto(this.state._csrf, (err) => {
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          }else{
            NotificationActions.showNotification(
              {
                message: _this.__('Image Removed'),
                position: 'bottomright',
                dismissAfter: 3000
            });
          }
        });
      }
    });
  }

  render(){
    const {photo} = this.props;

    const imageCrop = (
      <ImageCrop ref="imagecrop" aspectRatio={1} lockAspect={true} resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
    );
  
    if(photo && photo.photo_id){
      const photoUrl = `/feature/photo/${photo.photo_id}.jpg`;

      return (
        <div>
          <img style={{width: 'auto', maxHeight:'calc(100% - 58px)', paddingTop: '10px'}} src={photoUrl} alt="feature photo attachment"/>
          <div className="row no-margin">
          <button className="btn" style={{marginLeft: '10px'}}
            onClick={this.showImageCrop}>{this.__('Replace Photo')}</button>
            <button className="btn" style={{marginLeft: '10px'}}
              onClick={this.deletePhoto}>{this.__('Remove Photo')}</button>
          </div>
          {imageCrop}
        </div>
      );
    }else{
      return (
          <div>
            <div style={{maxHeight:'calc(100% - 58px)', paddingTop: '10px'}}>
              <i className="material-icons grey-text valign" style={{fontSize: '72px', margin: '10px'}}>add_a_photo</i>
            </div>
            <div className="row no-margin">
              <button className="btn" style={{marginLeft: '10px'}}
                onClick={this.showImageCrop}>{this.__('Add Photo')}</button>
            </div>
            {imageCrop}
          </div>
        );
    }
  }
}