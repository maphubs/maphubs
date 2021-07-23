import React from 'react'
import Header, { HeaderConfig } from '../header'
import Footer, { FooterConfig } from '../footer'
import Head from 'next/head'
import { useSession } from 'next-auth/client'
import { signin } from 'next-auth/client'

import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  title?: string
  activePage?: string
  hideFooter?: boolean
  publicShare?: boolean
  headerConfig?: HeaderConfig
  footerConfig?: FooterConfig
  children: JSX.Element | JSX.Element[]
}
const Layout = ({
  title,
  activePage,
  hideFooter,
  publicShare,
  headerConfig,
  footerConfig,
  children
}: Props): JSX.Element => {
  const [session, loading] = useSession()

  // redirect to login if not signed in, prevents displaying an error when data fails to load
  // for public shared maps we need to by-pass this check
  if (!session?.user && !publicShare && MAPHUBS_CONFIG.requireLogin) {
    signin()
    return (
      <div>
        <Head>
          <title>{`${title} - ${MAPHUBS_CONFIG.productName}`}</title>
        </Head>
      </div>
    )
  }

  return (
    <>
      <header>
        <Head>
          <title>{title}</title>
        </Head>
        <Header activePage={activePage} {...headerConfig} />
      </header>
      <main>{children}</main>
      {!hideFooter && (
        <footer>
          <Footer {...footerConfig} />
        </footer>
      )}
    </>
  )
}
export default Layout
