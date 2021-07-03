import React from 'react'
import { Row, Col, Typography } from 'antd'
import {
  UploadOutlined,
  CloudDownloadOutlined,
  UsergroupAddOutlined,
  ReadOutlined
} from '@ant-design/icons'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography

const MapHubsProLinks = ({ t }: { t: (v: string) => string }): JSX.Element => {
  return (
    <Row
      style={{
        width: '100%'
      }}
    >
      <Col sm={24} md={6}>
        <div
          className='mhp-links-icon-wrapper'
          style={{
            textAlign: 'center'
          }}
        >
          <a
            href='/createlayer'
            style={{
              margin: 'auto'
            }}
          >
            <div
              className='valign-wrapper'
              style={{
                height: '125px',
                position: 'relative',
                margin: 'auto'
              }}
            >
              <UploadOutlined />
            </div>
            <Title level={4}>{t('Create a Layer')}</Title>
          </a>
        </div>
      </Col>
      <Col sm={24} md={6}>
        <div
          className='mhp-links-icon-wrapper'
          style={{
            textAlign: 'center'
          }}
        >
          <a
            href='/import'
            style={{
              margin: 'auto'
            }}
          >
            <div
              className='valign-wrapper'
              style={{
                height: '125px',
                position: 'relative',
                margin: 'auto'
              }}
            >
              <CloudDownloadOutlined />
            </div>
            <Title level={4}>{t('Import MapHubs File')}</Title>
          </a>
        </div>
      </Col>
      <Col sm={24} md={6}>
        <div
          className='mhp-links-icon-wrapper'
          style={{
            textAlign: 'center'
          }}
        >
          <a
            href='/creategroup'
            style={{
              margin: 'auto'
            }}
          >
            <div
              className='valign-wrapper'
              style={{
                height: '125px',
                position: 'relative',
                margin: 'auto'
              }}
            >
              <UsergroupAddOutlined />
            </div>
            <Title level={4}>{t('Create a Group')}</Title>
          </a>
        </div>
      </Col>
      <Col sm={24} md={6}>
        <div
          className='mhp-links-icon-wrapper'
          style={{
            textAlign: 'center'
          }}
        >
          <a
            href='/createstory'
            style={{
              margin: 'auto'
            }}
          >
            <div
              className='valign-wrapper'
              style={{
                height: '125px',
                position: 'relative',
                margin: 'auto'
              }}
            >
              <ReadOutlined />
            </div>
            <Title level={4}>{t('Create a Story')}</Title>
          </a>
        </div>
      </Col>
      <style jsx global>
        {`
          .mhp-links-icon-wrapper {
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
            color: #fff;
            background-color: ${MAPHUBS_CONFIG.primaryColor};

            -o-transition: 0.5s;
            -ms-transition: 0.5s;
            -moz-transition: 0.5s;
            -webkit-transition: 0.5s;
            transition: 0.5s;
          }
          .mhp-links-icon-wrapper:hover .anticon,
          .mhp-links-icon-wrapper:hover h5 {
            color: #fff;
          }
        `}
      </style>
    </Row>
  )
}
export default MapHubsProLinks
