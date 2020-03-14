// @flow
import React from 'react'
import { Row, Col } from 'antd'
import { CompassOutlined, EnvironmentOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  t: Function
}

export default class OnboardingLinks extends React.PureComponent<Props, void> {
  render () {
    const {t} = this.props
    return (
      <Row style={{width: '100%'}}>
        <Col sm={24} md={6}>
          <div className='home-onboarding-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/maps' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <CompassOutlined />
              </div>
              <h5 className='center-align'>{t('Maps')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='home-onboarding-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/explore' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <EnvironmentOutlined />
              </div>
              <h5 className='center-align'>{t('Explore')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='home-onboarding-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/stories' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <ReadOutlined />
              </div>
              <h5 className='center-align'>{t('Stories')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='home-onboarding-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/search' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <SearchOutlined />
              </div>
              <h5 className='center-align'>{t('Search')}</h5>
            </a>
          </div>
        </Col>
        <style jsx global>{`
          .home-onboarding-icon-wrapper{
            border-radius: 25px;
          }

          .home-onboarding-icon-wrapper .anticon {
            color: ${MAPHUBS_CONFIG.primaryColor};
            font-size: 80px;
            margin: auto;
          }

          .home-onboarding-icon-wrapper h5 {
            color: #323333;
          }

          .home-onboarding-icon-wrapper:hover {
            color: #FFF;
            background-color: ${MAPHUBS_CONFIG.primaryColor};

            -o-transition:.5s;
            -ms-transition:.5s;
            -moz-transition:.5s;
            -webkit-transition:.5s;
            transition:.5s;
          }
          .home-onboarding-icon-wrapper:hover .anticon, .home-onboarding-icon-wrapper:hover h5 {
            color: #FFF;
          }
        `}
        </style>
      </Row>
    )
  }
}
