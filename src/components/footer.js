// @flow
import React from 'react'
import getConfig from 'next/config'
import { Row, Col } from 'antd'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  copyrightText: string,
  showPoweredByMapHubs: boolean,
  showMapForEnvironmentMoabiLogo: boolean,
  showContactUs: boolean,
  customLeftColumnItems: Array<string>,
  links: Array<Object>,
  t: Function
}

export default class Footer extends React.Component<Props, void> {
  static defaultProps = {
    showPoweredByMapHubs: true,
    showMapForEnvironmentMoabiLogo: false,
    showContactUs: true,
    customLeftColumnItems: []
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const _this = this
    const {
      showMapForEnvironmentMoabiLogo,
      copyrightText,
      showPoweredByMapHubs,
      showContactUs,
      links,
      customLeftColumnItems,
      t
    } = this.props

    return (
      <footer className='page-footer'>
        <div className='container'>
          <Row justify='left' align='top' style={{paddingTop: '15px'}}>
            <Col sm={24} lg={12}>
              {showMapForEnvironmentMoabiLogo &&
                <ul style={{marginTop: '0px'}}>
                  <li className='valign-wrapper'>
                    <a href='http://moabi.org' className='valign page-footer no-padding' style={{float: 'left', paddingRight: '5px'}}>
                      <img width='75' height='75' style={{marginLeft: '-10px'}} src='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/moabi-logo.png' alt='Moabi.org' />
                    </a>
                    <span className='valign'>{MAPHUBS_CONFIG.productName + t(' is a non-profit initiative of the Moabi organization')}</span>

                  </li>
                </ul>}
              {showPoweredByMapHubs &&
                <ul>
                  <li className='valign-wrapper'>
                    <span className='valign'>{t('Powered by') + ' '}</span>
                    <a href='http://maphubs.com' className='valign page-footer no-padding' style={{float: 'left'}}>
                      <img width='111' height='30' style={{marginTop: '10px'}} src='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/maphubs-logo-small.png' alt='MapHubs.com' />
                    </a>

                  </li>
                  <li>
                    {t('View the open source code on ')}<a className='page-footer  no-padding' href='https://github.com/maphubs'>GitHub</a>
                  </li>
                </ul>}
              <ul style={{marginTop: '0px'}}>
                {customLeftColumnItems.map((item, i) => {
                  return (
                    <li key={`custom-footer-item-${i}`}>
                      <div dangerouslySetInnerHTML={{__html: item}} />
                    </li>
                  )
                })}
              </ul>
            </Col>
            <Col sm={24} lg={6}>
              {showContactUs &&
                <ul>
                  <li>{t('Contact Us')}</li>
                  <li><a className='page-footer no-padding center' href={`mailto:${MAPHUBS_CONFIG.contactEmail}`}>{MAPHUBS_CONFIG.contactEmail}</a></li>
                  <li><a className='page-footer no-padding center' href={'http://twitter.com/' + MAPHUBS_CONFIG.twitter}>@{MAPHUBS_CONFIG.twitter}</a></li>
                </ul>}
            </Col>
            <Col sm={24} lg={6}>
              {links &&
                <ul>
                  {_this.props.links.map((link, i) => {
                    return (
                      <li key={`footer-link-${i}`}>
                        <a className='page-footer no-padding' href={link.href} target={link.target}>{t(link.name)}</a>
                      </li>
                    )
                  })}
                </ul>}
            </Col>
          </Row>
        </div>
        <div className='footer-copyright'>
          <div className='container center'>
            {copyrightText &&
              <small>&copy; {this.props.copyrightText}</small>}
            {!copyrightText &&
              <small>&copy; 2020 {MAPHUBS_CONFIG.productName}</small>}
          </div>
        </div>
      </footer>
    )
  }
}
