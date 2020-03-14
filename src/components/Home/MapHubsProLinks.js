// @flow
import React from 'react'
import { Row, Col } from 'antd'
import { UploadOutlined, CloudDownloadOutlined, UsergroupAddOutlined, ReadOutlined } from '@ant-design/icons'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  t: Function
}

export default class MapHubsProLinks extends React.PureComponent<Props, void> {
  render () {
    const {t} = this.props
    return (
      <Row style={{width: '100%'}}>
        <Col sm={24} md={6}>
          <div className='mhp-links-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/createlayer' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <UploadOutlined />
              </div>
              <h5>{t('Create a Layer')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='mhp-links-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/createremotelayer' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <CloudDownloadOutlined />
              </div>
              <h5>{t('Link Remote Layer')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='mhp-links-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/creategroup' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <UsergroupAddOutlined />
              </div>
              <h5>{t('Create a Group')}</h5>
            </a>
          </div>
        </Col>
        <Col sm={24} md={6}>
          <div className='mhp-links-icon-wrapper' style={{textAlign: 'center'}}>
            <a href='/createstory' style={{margin: 'auto'}}>
              <div className='valign-wrapper' style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <ReadOutlined />
              </div>
              <h5>{t('Create a Story')}</h5>
            </a>
          </div>
        </Col>
        <style jsx global>{`
          .mhp-links-icon-wrapper{
            border-radius: 25px;
          }

          .mhp-links-icon-wrapper .anticon {
            color: ${MAPHUBS_CONFIG.primaryColor};
            font-size: 80px;
            margin: auto;
          }

          .mhp-links-icon-wrapper h5 {
            color: #323333;
          }

          .mhp-links-icon-wrapper:hover {
            color: #FFF;
            background-color: ${MAPHUBS_CONFIG.primaryColor};

            -o-transition:.5s;
            -ms-transition:.5s;
            -moz-transition:.5s;
            -webkit-transition:.5s;
            transition:.5s;
          }
          .mhp-links-icon-wrapper:hover .anticon, .mhp-links-icon-wrapper:hover h5 {
            color: #FFF;
          }
        `}
        </style>
      </Row>
    )
  }
}
