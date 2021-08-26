import Head from 'next/head'
import React from 'react'
import type { AppProps } from 'next/app'

import { Provider as NextAuthProvider } from 'next-auth/client'

// redux
import { Provider } from 'react-redux'
import store from '../src/redux/store'

//SWR
import SWRConfig from '../src/components/SWRConfig'

import { QueryParamProvider } from '../src/components/QueryParamProvider'

import '../src/maphubs.scss'

const MapHubs = ({ Component, pageProps }: AppProps): JSX.Element => {
  const { session } = pageProps
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{'MapHubs'}</title>
      </Head>
      <NextAuthProvider
        session={session}
        options={{
          basePath: `/api/auth`
        }}
      >
        <Provider store={store}>
          <SWRConfig>
            <QueryParamProvider>
              <Component {...pageProps} />
            </QueryParamProvider>
          </SWRConfig>
        </Provider>
      </NextAuthProvider>
    </>
  )
}
export default MapHubs
