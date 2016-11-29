declare class MapHubsConfig {
  productName: string;
  mapHubsPro: bool;
  host: string;
  host_internal: string;
  port: number;
  internal_port: number;
  theme: string;
  twitter: string;
  primaryColor: string;
  tileServiceUrl: string;
  https: boolean;
}

declare var MAPHUBS_CONFIG: MapHubsConfig;

import type ReactComponent from 'react';

type JSXHelper<T> = Class<ReactComponent<T,T,mixed>>;

type $JSXIntrinsics = {
  div: JSXHelper<{id: string, lang: string,  className: string, style: Object}>,
  p: JSXHelper<{id: string, lang: string, className: string, style: Object}>,
  b: JSXHelper<{id: string, style: Object}>,
  span: JSXHelper<{id: string, style: Object}>,
  a:  JSXHelper<{href: string, style: Object}>,
  h2:  JSXHelper<{className: string, style: Object}>,
  h3:  JSXHelper<{className: string, style: Object}>,
  h4:  JSXHelper<{className: string, style: Object}>,
  h5:  JSXHelper<{className: string, style: Object}>,
  main: JSXHelper<{className: string, style: Object}>,
  i: JSXHelper<{className: string, style: Object}>,
  img: JSXHelper<{className: string, src: string, style: Object}>,
  iframe: JSXHelper<{className: string, src: string, style: Object}>,
  button: JSXHelper<{className: string, type: string, style: Object}>,
  form: JSXHelper<{id: string, style: Object}>,
  input: JSXHelper<{id: string, style: Object}>,
};

declare module 'uuid/v4' {
  declare module.exports: any;
}
