import React from 'react'
import Header, { HeaderConfig } from '../header'
import Footer, { FooterConfig } from '../footer'
import Head from 'next/head'
import useSWR from 'swr'
import { useSession } from 'next-auth/client'
import { signin } from 'next-auth/client'
import useStickyResult from '../../hooks/useStickyResult'

type Props = {
  title?: string
  activePage?: string
  hideFooter?: boolean
  publicShare?: boolean
  children: JSX.Element | JSX.Element[]
}
const Layout = ({
  title,
  activePage,
  hideFooter,
  publicShare,
  children
}: Props): JSX.Element => {
  const [session, loading] = useSession()

  const { data } = useSWR([
    `{
       pageConfig {
         headerConfig
         footerConfig
       }
      }
  `
  ])
  const stickyData: {
    pageConfig: { headerConfig: HeaderConfig; footerConfig: FooterConfig }
  } = useStickyResult(data) || { pageConfig: null }
  if (loading) return <></>

  // redirect to login if not signed in, prevents displaying an error when data fails to load
  // for public shared maps we need to by-pass this check
  if (!session?.user && !publicShare && process.env.NEXT_PUBLIC_REQUIRE_LOGIN) {
    signin()
    return (
      <div>
        <Head>
          <title>{`${title} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`}</title>
        </Head>
      </div>
    )
  }

  const { pageConfig } = stickyData || {}

  const { headerConfig, footerConfig } = pageConfig || {}

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
