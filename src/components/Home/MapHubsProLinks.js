// @flow
import React from 'react'

type Props = {
  t: Function
}

export default class MapHubsProLinks extends React.PureComponent<Props, void> {
  render () {
    const {t} = this.props
    return (
      <div className='row no-margin'>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/createlayer' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>file_upload</i>
            </div>
            <h5 className='center-align'>{t('Create a Layer')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/createremotelayer' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>cloud_download</i>
            </div>
            <h5 className='center-align'>{t('Link Remote Layer')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/creategroup' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>group_work</i>
            </div>
            <h5 className='center-align'>{t('Create a Group')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/createstory' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>web</i>
            </div>
            <h5 className='center-align'>{t('Create a Story')}</h5>
          </a>
        </div>
      </div>
    )
  }
}
