// @flow
import React from 'react'
import Error from 'next/error'

import 'jquery'
import 'react-tippy/dist/tippy.css'

if (typeof window !== 'undefined') {
  require('materialize-css')
}

type Props = {
  statusCode: number
}

export default class ErrorPage extends React.Component<Props, void> {
  static getInitialProps ({res, err}) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode }
  }

  render () {
    return (
      <div>
        <header>
          <nav style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)'}}>
            <div className='nav-wrapper z-depth-0'>
              <a className='brand-logo valign-wrapper' href='/'>
                <img className='valign' width={MAPHUBS_CONFIG.logoWidth} height={MAPHUBS_CONFIG.logoHeight} style={{margin: '5px'}} src={MAPHUBS_CONFIG.logo} alt={MAPHUBS_CONFIG.productName} />
                <small id='beta-text' style={{position: 'absolute', top: '12px', left: MAPHUBS_CONFIG.logoWidth + 5 + 'px', fontSize: '12px'}}>{MAPHUBS_CONFIG.betaText}</small>
              </a>
            </div>
          </nav>
        </header>
        <main style={{height: 'calc(100% - 52px'}}>
          <Error statusCode={this.props.statusCode} />
        </main>
      </div>
    )
  }
}
