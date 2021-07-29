import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render(): JSX.Element {
    const assetHost =
      process.env.NODE_ENV === 'production' && process.env.ASSET_CDN_PREFIX
        ? process.env.ASSET_CDN_PREFIX
        : ''

    const iconFolder = process.env.THEME || 'maphubs'
    const themeUrl = process.env.THEME_URL
      ? process.env.THEME_URL + iconFolder
      : `${assetHost}/assets/themes/${iconFolder}`

    // TODO: fix ombed support
    /*
    let oembedTitle = ''
    let oembedUrl = ''

    if (options.oembed) {
      oembedUrl = `${options.baseUrl}/api/oembed/${options.oembed}?url=${
        options.baseUrl + options.reqUrl
      }`

      if (options.oembed === 'map') {
        oembedTitle = 'Maphubs Map'
      } else if (options.oembed === 'layer') {
        oembedTitle = 'Maphubs Layer'
      }
    }

             {options.oembed && (
            <link
              rel='alternate'
              type='application/json+oembed'
              href={`${oembedUrl}&format=json`}
              title={oembedTitle}
            />
          )}
          {options.oembed && (
            <link
              rel='alternate'
              type='text/xml+oembed'
              href={`${oembedUrl}&format=xml`}
              title={oembedTitle}
            />
          )}
    */

    return (
      <Html>
        <Head>
          <link
            rel='apple-touch-icon-precomposed'
            sizes='57x57'
            href={`${themeUrl}/apple-touch-icon-57x57.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='114x14'
            href={`${themeUrl}/apple-touch-icon-114x114.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='72x72'
            href={`${themeUrl}/apple-touch-icon-72x72.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='144x144'
            href={`${themeUrl}/apple-touch-icon-144x144.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='60x60'
            href={`${themeUrl}/apple-touch-icon-60x60.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='120x120'
            href={`${themeUrl}/apple-touch-icon-120x120.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='76x76'
            href={`${themeUrl}/apple-touch-icon-76x76.png`}
          />
          <link
            rel='apple-touch-icon-precomposed'
            sizes='152x152'
            href={`${themeUrl}/apple-touch-icon-152x152.png`}
          />
          <link
            rel='icon'
            type='image/png'
            href={`${themeUrl}/favicon-196x196.png`}
            sizes='196x196'
          />
          <link
            rel='icon'
            type='image/png'
            href={`${themeUrl}/favicon-96x96.png`}
            sizes='96x96'
          />
          <link
            rel='icon'
            type='image/png'
            href={`${themeUrl}/favicon-32x32.png`}
            sizes='32x32'
          />
          <link
            rel='icon'
            type='image/png'
            href={`${themeUrl}/favicon-16x16.png`}
            sizes='16x16'
          />
          <link
            rel='icon'
            type='image/png'
            href={`${themeUrl}/favicon-128.png`}
            sizes='128x128'
          />
          <meta
            name='application-name'
            content={process.env.NEXT_PUBLIC_PRODUCT_NAME}
          />
          <meta name='msapplication-TileColor' content='#FFFFFF' />
          <meta
            name='msapplication-TileImage'
            content={`${themeUrl}/mstile-144x144.png`}
          />
          <meta
            name='msapplication-square70x70logo'
            content={`${themeUrl}/mstile-70x70.png`}
          />
          <meta
            name='msapplication-square150x150logo'
            content={`${themeUrl}/mstile-150x150.png`}
          />
          <meta
            name='msapplication-wide310x150logo'
            content={`${themeUrl}/mstile-310x150.png`}
          />
          <meta
            name='msapplication-square310x310logo'
            content={`${themeUrl}/mstile-310x310.png`}
          />

          {process.env.FACEBOOK_APP_ID && (
            <meta property='fb:app_id' content={process.env.FACEBOOK_APP_ID} />
          )}
          {process.env.NEXT_PUBLIC_ENABLE_COMMENTS && (
            <script
              type='text/javascript'
              src='https://talk.maphubs.com/assets/js/embed.js'
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
          {process.env.NEXT_PUBLIC_DISABLE_FEEDBACK !== 'true' && (
            <script
              type='text/javascript'
              dangerouslySetInnerHTML={{
                __html: `
              Userback = window.Userback || {};
              Userback.access_token = '4787|6504|RgiVFuqtlpoFGgSIaXOnXXCwp21uxY9nDFXK8dnA6eNxb4jfph';
              (function(id) {
                  var s = document.createElement('script');
                  s.async = 1;s.src = 'https://static.userback.io/widget/v1.js';
                  var parent_node = document.head || document.body;parent_node.appendChild(s);
              })('userback-sdk');
          `
              }}
            />
          )}
          {process.env.NODE_ENV === 'production' &&
            process.env.GOOGLE_ANALYTICS_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

              ga('create', '${process.env.GOOGLE_ANALYTICS_ID}', 'auto');
              ga('send', 'pageview');
              `
                }}
              />
            )}
        </body>
      </Html>
    )
  }
}
