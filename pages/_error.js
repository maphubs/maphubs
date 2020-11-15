// @flow
import type {Element} from "React";import React from 'react'
import Error from 'next/error'
import { Layout } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Header } = Layout

type Props = {
  statusCode: number
}

export default class ErrorPage extends React.Component<Props, void> {
  static getInitialProps ({res, err}: {res: any, err: any}): {|statusCode: any | null|} {
    const statusCode = res ? res.statusCode : (err ? err.statusCode : null)
    return { statusCode }
  }

  render (): Element<"div"> {
    return (
      <div>
        <Header
          style={{
            padding: 0,
            height: '50px'
          }}
        >
          <div className='logo' style={{float: 'left'}}>
            <a className='valign-wrapper' href={MAPHUBS_CONFIG.logo}>
              <img className='valign' width={MAPHUBS_CONFIG.logoWidth} height={MAPHUBS_CONFIG.logoHeight} style={{margin: '5px'}} src={MAPHUBS_CONFIG.logo} alt={MAPHUBS_CONFIG.productName} />
              <small id='beta-text' style={{position: 'absolute', top: '12px', left: MAPHUBS_CONFIG.logoWidth + 5 + 'px', fontSize: '12px'}}>{MAPHUBS_CONFIG.betaText}</small>
            </a>
          </div>
        </Header>
        <main style={{height: 'calc(100% - 52px'}}>
          <Error statusCode={this.props.statusCode} />
        </main>
      </div>
    )
  }
}
