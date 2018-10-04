// @flow
import React from 'react'
import MapHubsComponent from './MapHubsComponent'

type Props = {
  copyrightText: string,
  showPoweredByMapHubs: boolean,
  showMapForEnvironmentMoabiLogo: boolean,
  showContactUs: boolean,
  customLeftColumnItems: Array<string>,
  links: Array<Object>
}

type DefaultProps = {
  showPoweredByMapHubs: boolean,
  showMapForEnvironmentMoabiLogo: boolean,
  showContactUs: boolean,
}

export default class Footer extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps: DefaultProps = {
    showPoweredByMapHubs: true,
    showMapForEnvironmentMoabiLogo: false,
    showContactUs: true,
    customLeftColumnItems: []
  }

  render () {
    const _this = this
    const {
      showMapForEnvironmentMoabiLogo,
      copyrightText,
      showPoweredByMapHubs,
      showContactUs,
      links,
      customLeftColumnItems
    } = this.props

    let m4eFooter = ''
    if (showMapForEnvironmentMoabiLogo) {
      m4eFooter = (
        <ul style={{marginTop: '0px'}}>
          <li className='valign-wrapper'>
            <a href='http://moabi.org' className='valign page-footer no-padding' style={{float: 'left', paddingRight: '5px'}}>
              <img width='75' height='75' style={{marginLeft: '-10px'}} src='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/moabi-logo.png' alt='Moabi.org' />
            </a>
            <span className='valign'>{MAPHUBS_CONFIG.productName + this.__(' is a non-profit initiative of the Moabi organization')}</span>

          </li>
        </ul>
      )
    }

    let copyright = ''

    if (copyrightText) {
      copyright = (
        <small>&copy; {this.props.copyrightText}</small>
      )
    } else {
      copyright = (
        <small>&copy; 2018 {MAPHUBS_CONFIG.productName}</small>
      )
    }

    let poweredByMapHubs = ''
    if (showPoweredByMapHubs) {
      poweredByMapHubs = (
        <ul>
          <li className='valign-wrapper'>
            <span className='valign'>{this.__('Powered by') + ' '}</span>
            <a href='http://maphubs.com' className='valign page-footer no-padding' style={{float: 'left'}}>
              <img width='111' height='30' style={{marginTop: '10px'}} src='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/maphubs-logo-small.png' alt='MapHubs.com' />
            </a>

          </li>
          <li>
            {this.__('View the open source code on ')}<a className='page-footer  no-padding' href='https://github.com/maphubs'>GitHub</a>
          </li>
        </ul>
      )
    }

    let contactUs = ''
    if (showContactUs) {
      contactUs = (
        <ul>
          <li>{this.__('Contact Us')}</li>
          <li><a className='page-footer no-padding center' href={`mailto:${MAPHUBS_CONFIG.contactEmail}`}>{MAPHUBS_CONFIG.contactEmail}</a></li>
          <li><a className='page-footer no-padding center' href={'http://twitter.com/' + MAPHUBS_CONFIG.twitter}>@{MAPHUBS_CONFIG.twitter}</a></li>
        </ul>
      )
    }

    let linkSection = ''
    if (links) {
      linkSection = (
        <ul>
          <li>{this.__('Learn More')}</li>
          {_this.props.links.map((link, i) => {
            return (
              <li key={`footer-link-${i}`}>
                <a className='page-footer no-padding' href={link.href} target={link.target}>{_this.__(link.name)}</a>
              </li>
            )
          })
          }
        </ul>
      )
    }

    return (
      <footer className='page-footer'>
        <div className='container'>

          <div className='row'>
            <div className='col l4 s12' style={{marginTop: '15px'}}>
              {m4eFooter}
              {poweredByMapHubs}
              <ul style={{marginTop: '0px'}}>
                {customLeftColumnItems.map((item, i) => {
                  return (
                    <li key={`custom-footer-item-${i}`} >
                      <div dangerouslySetInnerHTML={{__html: item}} />
                    </li>
                  )
                })}
              </ul>

            </div>
            <div className='col l5 s12'>
              {contactUs}
            </div>
            <div className='col l3 s12'>
              {linkSection}
            </div>
          </div>
        </div>
        <div className='footer-copyright'>
          <div className='container center'>
            {copyright}
          </div>
        </div>

      </footer>
    )
  }
}
