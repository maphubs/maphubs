import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import ErrorBoundary from '../src/components/ErrorBoundary'

type Props = {
  locale: string
  _csrf: string
  requireInvite?: boolean
  adminEmail: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class Error extends React.Component<Props> {
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
    const { t, props } = this
    const { requireInvite, adminEmail, headerConfig, footerConfig } = props

    const message = requireInvite ? (
      <p className='flow-text center-align'>
        {t('Accessing this site requires an invitation. Please contact us at ')}
        <a href={`mailto:${adminEmail}`}>{adminEmail}</a>
      </p>
    ) : (
      <p className='flow-text center-align'>
        {t(
          'We are having an issue finding your account. Please contact us at '
        )}
        <a href={`mailto:${adminEmail}`}>{adminEmail}</a>
      </p>
    )

    return (
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <main>
          <div className='container s12'>
            <h3 className='center-align'>{t('Unable to Access Account')}</h3>
            {message}
          </div>
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
