import React from 'react'
import Header from '../src/components/header'
import { Typography } from 'antd'
import ErrorBoundary from '../src/components/ErrorBoundary'

const { Title } = Typography
type Props = {
  user: Record<string, any>
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
}
export default class Auth0Profile extends React.Component<Props> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  render(): JSX.Element {
    const { t } = this
    return (
      <ErrorBoundary t={t}>
        <Header {...this.props.headerConfig} />
        <main className='container'>
          <Title>{t('User Profile')}</Title>
          <div id='profile'>
            <p>
              <b>{t('User Name')}: </b>
              {this.props.user.display_name}
            </p>
            <p>
              <b>{t('Email')}: </b>
              {this.props.user.email}
            </p>
            <div>
              <img
                className='circle'
                style={{
                  width: '250px',
                  height: '250px'
                }}
                src={this.props.user.picture}
              />
            </div>
            <p>{t('More user profile settings coming soon!')}</p>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
