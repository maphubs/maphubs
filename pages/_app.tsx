import Head from 'next/head'
import React from 'react'

// redux
import { Provider } from 'react-redux'
import { useStore } from '../src/redux/store'

const MapHubs = ({ Component, pageProps, err }: any): JSX.Element => {
  const { session, initialReduxState } = pageProps
  const store = useStore(initialReduxState)
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{'MapHubs'}</title>
      </Head>
      <Provider store={store}>
        <Component {...pageProps} err={err} />
      </Provider>
    </>
  )
}
export default MapHubs
