import React from 'react'
import Header, { HeaderConfig } from '../header'
import Footer, { FooterConfig } from '../footer'
import Head from 'next/head'
import { useSession } from 'next-auth/client'
import { signin } from 'next-auth/client'

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
  if (
    !session?.user &&
    !publicShare &&
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true'
  ) {
    signin()
    return (
      <div>
        <Head>
          <title>{`${title} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`}</title>
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
      <main style={{ height: 'calc(100vh - 52px)' }}>{children}</main>
      {!hideFooter && (
        <footer>
          <Footer {...footerConfig} />
        </footer>
      )}
    </>
  )
}
export default Layout
