import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'

import { createHash } from 'crypto'
import { readFileSync } from 'fs'

import local from '../src/local'

import version from '../version.json'

let cssHash = ''
if (process.env.NODE_ENV === 'production') {
  const hash = createHash('sha256')
  hash.update(readFileSync(`${process.cwd()}/.next/static/style.css`))
  cssHash = `?v=${hash.digest('hex').substr(0, 8)}`
}

export default class MyDocument extends Document {
  render () {
    const data = this.props['__NEXT_DATA__']
    const options = data.query
    const props = options.props || {}

    let iconFolder = local.theme
    if (local.theme === 'maphubs-pro') {
      iconFolder = 'maphubs'
    }

    let assetHost = ''
    if (process.env.NODE_ENV === 'production' && !local.useLocalAssets) {
      assetHost = 'https://cdn.maphubs.com'
    }

    let themeUrl = ''
    if (local.themeUrl) {
      themeUrl = local.themeUrl + iconFolder
    } else {
      themeUrl = `${assetHost}/assets/themes/${iconFolder}`
    }

    let oembedTitle = ''
    let oembedUrl = ''
    if (options.oembed) {
      oembedUrl = `${options.baseUrl}/api/oembed/${options.oembed}?url=${options.baseUrl + options.reqUrl}`
      if (options.oembed === 'map') {
        oembedTitle = 'Maphubs Map'
      } else if (options.oembed === 'layer') {
        oembedTitle = 'Maphubs Layer'
      }
    }

    const materialicons = options.materialicons ? options.materialicons : true

    let ravenConfig = ''
    if (process.env.NODE_ENV === 'production' && !local.disableTracking) {
      ravenConfig = local.SENTRY_DSN_PUBLIC
    }

    let email = ''
    let user_id = ''
    let display_name = ''
    if (props.user) {
      //  username = req.session.user.display_name;
      email = props.user.email
      user_id = props.user.id
      display_name = props.user.display_name
    }

    return (
      <html lang={options.locale}>
        <Head>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <title>{data.query.title || 'MapHubs'}</title>
          <link rel='stylesheet' href={`/_next/static/style.css${cssHash}`} />
          {options.description &&
            <meta name='description' content={options.description} />
          }
          <link rel='apple-touch-icon-precomposed' sizes='57x57' href={`${themeUrl}/apple-touch-icon-57x57.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='114x14' href={`${themeUrl}/apple-touch-icon-114x114.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='72x72' href={`${themeUrl}/apple-touch-icon-72x72.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='144x144' href={`${themeUrl}/apple-touch-icon-144x144.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='60x60' href={`${themeUrl}/apple-touch-icon-60x60.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='120x120' href={`${themeUrl}/apple-touch-icon-120x120.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='76x76' href={`${themeUrl}/apple-touch-icon-76x76.png`} />
          <link rel='apple-touch-icon-precomposed' sizes='152x152' href={`${themeUrl}/apple-touch-icon-152x152.png`} />
          <link rel='icon' type='image/png' href={`${themeUrl}/favicon-196x196.png`} sizes='196x196' />
          <link rel='icon' type='image/png' href={`${themeUrl}/favicon-96x96.png`} sizes='96x96' />
          <link rel='icon' type='image/png' href={`${themeUrl}/favicon-32x32.png`} sizes='32x32' />
          <link rel='icon' type='image/png' href={`${themeUrl}/favicon-16x16.png`} sizes='16x16' />
          <link rel='icon' type='image/png' href={`${themeUrl}/favicon-128.png`} sizes='128x128' />
          <meta name='application-name' content={local.productName} />
          <meta name='msapplication-TileColor' content='#FFFFFF' />
          <meta name='msapplication-TileImage' content={`${themeUrl}/mstile-144x144.png`} />
          <meta name='msapplication-square70x70logo' content={`${themeUrl}/mstile-70x70.png`} />
          <meta name='msapplication-square150x150logo' content={`${themeUrl}/mstile-150x150.png`} />
          <meta name='msapplication-wide310x150logo' content={`${themeUrl}/mstile-310x150.png`} />
          <meta name='msapplication-square310x310logo' content={`${themeUrl}/mstile-310x310.png`} />
          {options.oembed &&
            <link rel='alternate' type='application/json+oembed' href={`${oembedUrl}&format=json`} title={oembedTitle} />
          }
          {options.oembed &&
            <link rel='alternate' type='text/xml+oembed' href={`${oembedUrl}&format=xml`} title={oembedTitle} />
          }
          {(options.twitterCard && options.twitterCard.card) &&
            <meta name='twitter:card' content={options.twitterCard.card} />
          }
          {(options.twitterCard && !options.twitterCard.card) &&
            <meta name='twitter:card' content='summary_large_image' />
          }
          {options.twitterCard &&
            <meta name='twitter:site' content={`@${local.twitter}`} />
          }
          {options.twitterCard &&
            <meta name='twitter:title' content={options.twitterCard.title} />
          }
          {(options.twitterCard && options.twitterCard.description) &&
            <meta name='twitter:description' content={options.twitterCard.description} />
          }
          {(options.twitterCard && options.twitterCard.image) &&
            <meta name='twitter:image' content={options.twitterCard.image} />
          }
          {local.FACEBOOK_APP_ID &&
            <meta property='fb:app_id' content={local.FACEBOOK_APP_ID} />
          }
          {(options.twitterCard && options.twitterCard.title) &&
            <meta property='og:title' content={options.twitterCard.title} />
          }
          {(options.twitterCard && options.twitterCard.description) &&
            <meta property='og:description' content={options.twitterCard.description} />
          }
          {options.twitterCard &&
            <meta property='og:type' content='website' />
          }
          {options.twitterCard &&
            <meta property='og:url' content={options.baseUrl + options.reqUrl} />
          }
          {(options.twitterCard && options.twitterCard.image) &&
            <meta property='og:image' content={options.twitterCard.image} />
          }
          {(options.twitterCard && options.twitterCard.image && options.twitterCard.imageType) &&
            <meta property='og:image:type' content={options.twitterCard.imageType} />
          }
          {(options.twitterCard && options.twitterCard.image && !options.twitterCard.imageType) &&
            <meta property='og:image:type' content='image/png' />
          }
          {(options.twitterCard && options.twitterCard.image && options.twitterCard.imageWidth) &&
            <meta property='og:image:width' content={options.twitterCard.imageWidth} />
          }
          {(options.twitterCard && options.twitterCard.image && options.twitterCard.imageHeight) &&
            <meta property='og:image:height' content={options.twitterCard.imageHeight} />
          }
          {materialicons &&
            <link href={assetHost + '/assets/css/material-icons.css'} rel='stylesheet' />
          }
          <link rel='stylesheet' type='text/css' href='/css/maphubs.css' />
          <script type='text/javascript' dangerouslySetInnerHTML={{__html: `
              var MAPHUBS_CONFIG = {
                host: "${local.host}",
                port: ${local.port},
                https: ${local.https},
                productName: "${local.productName}",
                logo: "${local.logo}",
                logoSmall: "${local.logoSmall}",
                logoWidth: ${local.logoWidth},
                logoHeight: ${local.logoHeight},
                logoSmallWidth: ${local.logoSmallWidth},
                logoSmallHeight: ${local.logoSmallHeight},
                primaryColor: "${local.primaryColor}",
                betaText: "${local.betaText}",
                twitter: "${local.twitter}",
                contactEmail: "${local.contactEmail}",
                mapHubsPro: ${local.mapHubsPro},
                enableComments: ${local.enableComments},
                CORAL_TALK_ID: "${!options.login ? local.CORAL_TALK_ID : ''}",
                CORAL_TALK_HOST: "${local.CORAL_TALK_HOST}",
                FR_ENABLE: ${local.FR_ENABLE},
                FR_API: "${local.FR_API}",
                FR_API_KEY: "${(!options.login || !options.publicShare) ? local.FR_API_KEY : ''}",
                tileServiceUrl: "${local.tileServiceUrl}",
                MAPBOX_ACCESS_TOKEN: "${!options.login ? local.MAPBOX_ACCESS_TOKEN : ''}",
                TILEHOSTING_GEOCODING_API_KEY: "${!options.login ? local.TILEHOSTING_GEOCODING_API_KEY : ''}",
                TILEHOSTING_MAPS_API_KEY: "${!options.login ? local.TILEHOSTING_MAPS_API_KEY : ''}",
                PLANET_LABS_API_KEY: "${!options.login ? local.PLANET_LABS_API_KEY : ''}",
                DG_WMS_CONNECT_ID: "${!options.login ? local.DG_WMS_CONNECT_ID : ''}",
                BING_KEY:  "${!options.login ? local.BING_KEY : ''}",
                SENTRY_DSN_PUBLIC:  "${local.SENTRY_DSN_PUBLIC}",
                theme: "${local.theme}",
                themeUrl: "${local.themeUrl}",
                enableUserExport: "${local.enableUserExport}",
                OPENROUTESERVICE_API_KEY:  "${local.OPENROUTESERVICE_API_KEY}"
              }
          `}}
          />
          <script src='https://cdn.ravenjs.com/3.20.1/raven.min.js' crossOrigin='anonymous' />
          <script type='text/javascript' dangerouslySetInnerHTML={{__html: `
              Raven.config('${ravenConfig}', {
              release: '${version.version}',
              environment: '${local.ENV_TAG}',
              tags: {host: '${local.host}'}
            }).install();
          `}} />
          {options.talkComments &&
            <script type='text/javascript' src='https://talk.maphubs.com/embed.js' />
          }
          {options.rangy &&
            <script src={`${assetHost}/assets/js/rangy-core.js`} />
          }
          {options.rangy &&
            <script src={`${assetHost}/assets/js/rangy-cssclassapplier.js`} />
          }
          {!options.hideFeedback &&
          <script dangerouslySetInnerHTML={{__html: `
            Userback = window.Userback || {};
            Userback.access_token = '1543|2037|tb9c1TOxoFcMIA834eVabMRUqZaUgieJunWvgL3Fqfr9PAcTO8';
        
            Userback.email = '${email}';
            Userback.custom_data = {
              account_id: '${user_id}',
              name: '${display_name}'
            };

            Userback.widget_settings = {
                language: '${options.locale}',
                style: 'circle',
                position: 'se',
                main_button_background_colour : '${local.primaryColor}', 
                main_button_text_colour       : '#FFFFFF', 
                send_button_background_colour : '${local.primaryColor}', 
                send_button_text_colour       : '#FFFFFF'  
            };
            Userback.after_send = function() {
                // alert('after send');
            };
        
            (function(id) {
                if (document.getElementById(id)) {return;}
                var s = document.createElement('script');
                s.id = id;
                s.src = 'https://static.userback.io/widget/v1.js';
                var parent_node = document.head || document.body;
                parent_node.appendChild(s);
            })('userback-sdk');
            `}} />
          }
        </Head>
        <body>
          <Main />
          <NextScript />
          {options.fontawesome &&
            <link href={assetHost + '/assets/css/font-awesome.css'} rel='stylesheet' />
          }
          <link href={assetHost + '/assets/css/raleway.css'} rel='stylesheet' type='text/css' />
          <link href={assetHost + '/assets/css/opensans.css'} rel='stylesheet' type='text/css' />

          {(process.env.NODE_ENV === 'production' && !local.disableTracking && !options.disableGoogleAnalytics) &&
            <script dangerouslySetInnerHTML={{__html: `
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

              ga('create', '${local.GOOGLE_ANALYTICS_ID}', 'auto');
              ga('send', 'pageview');
              `}} />
          }
        </body>
      </html>
    )
  }
}
