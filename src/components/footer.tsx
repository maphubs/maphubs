import React from 'react'
import getConfig from 'next/config'
import { Row, Col } from 'antd'
import useT from '../hooks/useT'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
export type FooterConfig = {
  copyrightText?: string
  showPoweredByMapHubs?: boolean
  showContactUs?: boolean
  customLeftColumnItems?: Array<string>
  links?: Array<Record<string, any>>
}
type Props = FooterConfig
const Footer = ({
  copyrightText,
  showPoweredByMapHubs,
  showContactUs,
  links,
  customLeftColumnItems
}: Props): JSX.Element => {
  const { t } = useT()
  return (
    <footer className='page-footer'>
      <div className='container'>
        <Row
          justify='start'
          align='top'
          style={{
            paddingTop: '15px'
          }}
        >
          <Col sm={24} lg={12}>
            {showPoweredByMapHubs && (
              <ul>
                <li className='valign-wrapper'>
                  <span className='valign'>{t('Powered by') + ' '}</span>
                  <a
                    href='http://maphubs.com'
                    className='valign page-footer no-padding'
                    style={{
                      float: 'left'
                    }}
                  >
                    <img
                      width='111'
                      height='30'
                      style={{
                        marginTop: '10px'
                      }}
                      src='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/maphubs-logo-small.png'
                      alt='MapHubs.com'
                    />
                  </a>
                </li>
              </ul>
            )}
            <ul
              style={{
                marginTop: '0px'
              }}
            >
              {customLeftColumnItems.map((item, i) => {
                return (
                  <li key={`custom-footer-item-${i}`}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: item
                      }}
                    />
                  </li>
                )
              })}
            </ul>
          </Col>
          <Col sm={24} lg={6}>
            {showContactUs && (
              <ul>
                <li>{t('Contact Us')}</li>
                <li>
                  <a
                    className='page-footer no-padding center'
                    href={`mailto:${MAPHUBS_CONFIG.contactEmail}`}
                  >
                    {MAPHUBS_CONFIG.contactEmail}
                  </a>
                </li>
                <li>
                  <a
                    className='page-footer no-padding center'
                    href={'http://twitter.com/' + MAPHUBS_CONFIG.twitter}
                  >
                    @{MAPHUBS_CONFIG.twitter}
                  </a>
                </li>
              </ul>
            )}
          </Col>
          <Col sm={24} lg={6}>
            {links && (
              <ul>
                {links.map((link, i) => {
                  return (
                    <li key={`footer-link-${i}`}>
                      <a
                        className='page-footer no-padding'
                        href={link.href}
                        target={link.target}
                      >
                        {t(link.name)}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </Col>
        </Row>
      </div>
      <div className='footer-copyright'>
        <div className='container center'>
          {copyrightText && <small>&copy; {copyrightText}</small>}
          {!copyrightText && (
            <small>&copy; 2021 {MAPHUBS_CONFIG.productName}</small>
          )}
        </div>
      </div>
    </footer>
  )
}

Footer.defaultProps = {
  showPoweredByMapHubs: true,
  showContactUs: true,
  customLeftColumnItems: []
}

export default Footer
