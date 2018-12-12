// @flow
import React from 'react'

type Props = {
  t: Function
}

export default class OnboardingLinks extends React.PureComponent<Props, void> {
  render () {
    const {t} = this.props
    return (
      <div className='row no-margin'>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/map/new' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>map</i>
            </div>
            <h5 className='center-align'>{t('Make a Map')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/explore' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>explore</i>
            </div>
            <h5 className='center-align'>{t('Explore')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/stories' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>chat_bubble</i>
            </div>
            <h5 className='center-align'>{t('Write a Map Story')}</h5>
          </a>
        </div>
        <div className='col s12 m3 l3 home-onboarding-icon-wrapper' style={{margin: 'auto'}}>
          <a href='/search' style={{margin: 'auto'}}>
            <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className='material-icons valign center-align' style={{fontSize: '80px', margin: 'auto'}}>search</i>
            </div>
            <h5 className='center-align'>{t('Search')}</h5>
          </a>
        </div>
      </div>
    )
  }
}
