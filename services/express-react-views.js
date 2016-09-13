/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/*
 Modified to support isomorphic JS
 1) Assumes there is a client js file with the same name as the view in for examples client/login.js
 2) Assumes that the client will load its data out of window.__appData and use the query selector id="app"
 */
 /* @flow weak */
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var assign = require('object-assign');
var log = require('./log');
var version = require('../version.json').version;
var local = require('../local');
var urlUtil = require('./url-util');
var DEFAULT_OPTIONS = {
  doctype: '<!DOCTYPE html>'
};

function createEngine(engineOptions) {
  var registered = false;
  var moduleDetectRegEx;

  engineOptions = assign({}, DEFAULT_OPTIONS, engineOptions || {});

  function renderFile(filename, options, cb) {

    var materialicons = options.materialicons ? options.materialicons : true;
    // Defer babel registration until the first request so we can grab the view path.
    if (!registered) {
      moduleDetectRegEx = new RegExp('^' + options.settings.views);
      // Passing a RegExp to Babel results in an issue on Windows so we'll just
      // pass the view path.
      /*require('babel/register')({
        stage: 0,
        ignore: false
      });*/
      registered = true;
    }
      var markup = null;
    try {
      markup = engineOptions.doctype;
      var component = require(filename);
      // Transpiled ES6 may export components as { default: Component }
      component = component.default || component;

      if(!options.props){
        options.props = {};
      }
      var locale = 'en';
      var req = null;
      if(options.req){
        req = options.req;
        if(options.req.session.locale){
          //the user has specified a language from the options on the website
          locale = req.session.locale;
          req.setLocale(locale);
        }else{
          //use local from i18n parsing of http accept-language
          locale = req.locale;
        }
      }else{
        log.error('req object not found when rendering view: ' + filename);
      }
      options.props.locale = locale;

      //include version number in all pages for debugging
      options.props.version = version;

      var appData = JSON.stringify(options.props, null, 2);

      var reactMarkup = ReactDOMServer.renderToString(React.createElement(component, options.props));

      // assume that there is always client file with the same name as the view
      var clientFileName = this.name;
      var title = this.name;
      if(options.title){
        title = options.title;
      }

      //#TODO:230 set HTML header meta tags and language tags
      markup += `
      <html lang="` + locale + `">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>` + title +`</title>
        `;

        if(options.description){
          markup += `
            <meta name="description" content="` + options.description + `"/>
          `;
        }

        //icons
        markup += `
        <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/assets/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/assets/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/assets/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/assets/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/assets/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/assets/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/assets/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/assets/apple-touch-icon-152x152.png" />
        <link rel="icon" type="image/png" href="/assets/favicon-196x196.png" sizes="196x196" />
        <link rel="icon" type="image/png" href="/assets/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/assets/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/assets/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/assets/favicon-128.png" sizes="128x128" />
        <meta name="application-name" content="&nbsp;"/>
        <meta name="msapplication-TileColor" content="#FFFFFF" />
        <meta name="msapplication-TileImage" content="/assets/mstile-144x144.png" />
        <meta name="msapplication-square70x70logo" content="/assets/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/assets/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/assets/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/assets/mstile-310x310.png" />
        `;

        if(options.oembed){
          var baseUrl = urlUtil.getBaseUrl(local.host, local.port);
          var url = baseUrl + '/api/oembed/' + options.oembed + '?url=' + baseUrl + req.url;
          markup += `
          <link rel="alternate" type="application/json+oembed" href="` + url + `&format=json" title="Maphubs Map" />
          <link rel="alternate" type="text/xml+oembed" href="` + url + `&format=xml" title="Maphubs Map" />
          `;
        }

        if(options.twitterCard){
          markup += `
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:site" content="@maphubs">
          <meta name="twitter:title" content="` + options.twitterCard.title + `">
          <meta name="twitter:description" content="` + options.twitterCard.description + `">
          <meta name="twitter:image" content="` + options.twitterCard.image + `">
          `;

          var baseUrl = urlUtil.getBaseUrl(local.host, local.port);
          var url = baseUrl + req.url;

          markup += `
          <meta property="og:title" content="` + options.twitterCard.title + `" />
          <meta property="og:description" content="` + options.twitterCard.description + `" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="` + url + `" />
          <meta property="og:image" content="` + options.twitterCard.image + `" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          `;
        }

        if(materialicons){
          //https://fonts.googleapis.com/icon?family=Material+Icons
          markup += '<link href="/assets/css/material-icons.css" rel="stylesheet">\n';
        }
        if(options.fontawesome){
          //https://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css
          markup += '<link href="/assets/css/font-awesome.css" rel="stylesheet">\n';
        }
        //https://fonts.googleapis.com/css?family=Raleway|Merriweather:400,700,400italic
        markup += '<link href="/assets/css/raleway.css" rel="stylesheet" type="text/css">\n';
        //https://fonts.googleapis.com/css?family=Open+Sans
        markup += '<link href="/assets/css/opensans.css" rel="stylesheet" type="text/css">\n';
        markup +=
        '<link rel="stylesheet" type="text/css" href="/public/vendor.css">' +
        '<link rel="stylesheet" type="text/css" href="/public/' + clientFileName + '.css">' +
        '</head>\n'+
        '<body>\n' +
         ' <div id="app">' + reactMarkup + '</div>\n' +
          '<script>window.__appData = ' + appData + '; </script>\n' +
          '<script type="text/javascript" src="/public/vendor.js"></script>\n' +
          '<script type="text/javascript" src="/public/locales.js"></script>\n' +
          '<script type="text/javascript" src="/public/clientconfig.js"></script>\n' +
          '<script type="text/javascript" src="/public/' + clientFileName + '.js"></script>\n';

        if(options.rangy){
          markup +=
          '<script src="/assets/js/rangy-core.js"></script>\n' +
          '<script src="/assets/js/rangy-cssclassapplier.js"></script>\n';
        }

        if(options.addthis  && !local.disableTracking){
          markup += '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-55d2323271adc34b" async="async"></script>\n';
        }

        if(options.mailchimp && !local.disableTracking){
          markup += '<script type="text/javascript" src="//s3.amazonaws.com/downloads.mailchimp.com/js/signup-forms/popup/embed.js" data-dojo-config="usePlainJson: true, isDebug: false"></script><script type="text/javascript">require(["mojo/signup-forms/Loader"], function(L) { L.start({"baseUrl":"mc.us12.list-manage.com","uuid":"d2eac39a023dd41d2dd00b58e","lid":"0cbfb0b04d"}) })</script>';
        }

        if(!options.hideFeedback && req){
          var username = null;
          if(req.session && req.session.user){
            username = req.session.user.display_name;
          }

          var t = function(value){
            var translation = req.__(value);
            translation = translation.replace(/'/g ,'&#39;');
            return translation;
          };

          var beaconTranslation = {
            searchLabel: t('What can we help you with?'),
            searchErrorLabel: t('Your search timed out. Please double-check your internet connection and try again.'),
            noResultsLabel: t('No results found for'),
            contactLabel: t('Send a Message'),
            attachFileLabel: t('Attach a file'),
            attachFileError: t('The maximum file size is 10mb'),
            nameLabel: t('Your Name'),
            nameError: t('Please enter your name'),
            emailLabel: t('Email address'),
            emailError: t('Please enter a valid email address'),
            topicLabel: t('Select a topic'),
            topicError: t('Please select a topic from the list'),
            subjectLabel: t('Subject'),
            subjectError: t('Please enter a subject'),
            messageLabel: t('How can we help you?'),
            messageError: t('Please enter a message'),
            sendLabel: t('Send'),
            contactSuccessLabel: t('Message sent!'),
            contactSuccessDescription: t('Thanks for reaching out! Someone from our team will get back to you soon.')
          };

          var beaconTranslationText = JSON.stringify(beaconTranslation);

          markup += `
            <script>!function(e,o,n){
                window.HSCW=o,window.HS=n,n.beacon=n.beacon||{};
                var t=n.beacon;
                t.userConfig={icon: 'question', color: '#29ABE2', topArticles: true,
                  topics: [{val: 'question', label: '` + t('Question') + `'},{val: 'suggestion', label: '` + t('Suggestion') + `'},{val: 'problem', label: '` + t('Report a Problem') + `'}],
                  translation: ` + beaconTranslationText +`,
                },
                t.readyQueue=[],t.config=function(e){this.userConfig=e},t.ready=function(e){this.readyQueue.push(e)},o.config={docs:{enabled:!0,baseUrl:"//maphubs.helpscoutdocs.com/"},contact:{enabled:!0,formId:"59df584f-4d3b-11e6-aae8-0a7d6919297d"}};
                var r=e.getElementsByTagName("script")[0],c=e.createElement("script");
                c.type="text/javascript",c.async=!0,c.src="https://djtflbt20bdde.cloudfront.net/",r.parentNode.insertBefore(c,r)}(document,window.HSCW||{},window.HS||{});</script>
            `;

        }
      if(process.env.NODE_ENV == 'production' && !local.disableTracking){
        markup += `
        <script>
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

          ga('create', 'UA-75234840-1', 'auto');
          ga('send', 'pageview');

        </script>
        `;
      }
      markup +=
      '</body>\n' +
      '</html>\n'
    ;

    } catch (e) {
      return cb(e);
    }



    if (options.settings.env === 'development') {
      // Remove all files from the module cache that are in the view folder.
      Object.keys(require.cache).forEach(function(module) {
        if (moduleDetectRegEx.test(require.cache[module].filename)) {
          delete require.cache[module];
        }
      });
    }

    cb(null, markup);
  }

  return renderFile;
}

exports.createEngine = createEngine;
