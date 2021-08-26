import React from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/client'
import useStickyResult from '../../hooks/useStickyResult'
import LayoutSSR from './LayoutSSR'
import { HeaderConfig } from '../header'
import { FooterConfig } from '../footer'

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

  const { pageConfig } = stickyData || {}

  const { headerConfig, footerConfig } = pageConfig || {}

  return (
    <>
      <LayoutSSR
        headerConfig={headerConfig}
        footerConfig={footerConfig}
        title={title}
        activePage={activePage}
        publicShare={publicShare}
        hideFooter={hideFooter}
      >
        {children}
      </LayoutSSR>
    </>
  )
}
export default Layout
