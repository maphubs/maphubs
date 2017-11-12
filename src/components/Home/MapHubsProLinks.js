//@flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';

export default class MapHubsProLinks extends MapHubsPureComponent<void,void> {

render(){
  return (
    <div className="row no-margin">
        <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/createlayer" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>file_upload</i>
            </div>
            <h5 className="center-align">{this.__('Create a Layer')}</h5>
          </a>
        </div>
        <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/createremotelayer" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>cloud_download</i>
            </div>
            <h5 className="center-align">{this.__('Link Remote Layer')}</h5>
          </a>
        </div>
        <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/creategroup" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>group_work</i>
            </div>
            <h5 className="center-align">{this.__('Create a Group')}</h5>
          </a>
        </div>
        <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/createhub" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>web</i>
            </div>
            <h5 className="center-align">{this.__('Create a Hub')}</h5>
          </a>
        </div>
      </div>
  );
}
}