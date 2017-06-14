// flow-typed signature: 0acdce9a641563509b77e920c7c48111
// flow-typed version: <<STUB>>/reflux_v^6.4.1/flow_v0.47.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'reflux'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare class RefluxComponent<D, P, S> extends React$Component<D, P, S> {
  static defaultProps: D;
  props: P;
  state: S;
  stores: Array<any>
}

declare class RefluxStore {
  state: Object;
  listenables: any;
  setState(Object): void;
  trigger(Object): void;
  listenTo(Object): void;
}

declare module 'reflux' {
  declare module.exports: {
    Component: typeof RefluxComponent,
    init(): Function,
    Store: typeof RefluxStore
  };
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */

declare module 'reflux/dist/reflux' {
  declare module.exports: any
}

declare module 'reflux/dist/reflux.min' {
  declare module.exports: any
}

declare module 'reflux/Gruntfile' {
  declare module.exports: any;
}

declare module 'reflux/karma.conf' {
  declare module.exports: any;
}

declare module 'reflux/src/addES6' {
  declare module.exports: any;
}

declare module 'reflux/src/connect' {
  declare module.exports: any;
}

declare module 'reflux/src/connectFilter' {
  declare module.exports: any;
}

declare module 'reflux/src/defineReact' {
  declare module.exports: any;
}

declare module 'reflux/src/index' {
  declare module.exports: any;
}

declare module 'reflux/src/ListenerMixin' {
  declare module.exports: any;
}

declare module 'reflux/src/listenTo' {
  declare module.exports: any;
}

declare module 'reflux/src/listenToMany' {
  declare module.exports: any;
}

// Filename aliases
declare module 'reflux/dist/reflux.js' {
  declare module.exports: $Exports<'reflux/dist/reflux'>;
}
declare module 'reflux/dist/reflux.min.js' {
  declare module.exports: $Exports<'reflux/dist/reflux.min'>;
}
declare module 'reflux/Gruntfile.js' {
  declare module.exports: $Exports<'reflux/Gruntfile'>;
}
declare module 'reflux/karma.conf.js' {
  declare module.exports: $Exports<'reflux/karma.conf'>;
}
declare module 'reflux/src/addES6.js' {
  declare module.exports: $Exports<'reflux/src/addES6'>;
}
declare module 'reflux/src/connect.js' {
  declare module.exports: $Exports<'reflux/src/connect'>;
}
declare module 'reflux/src/connectFilter.js' {
  declare module.exports: $Exports<'reflux/src/connectFilter'>;
}
declare module 'reflux/src/defineReact.js' {
  declare module.exports: $Exports<'reflux/src/defineReact'>;
}
declare module 'reflux/src/index.js' {
  declare module.exports: $Exports<'reflux/src/index'>;
}
declare module 'reflux/src/ListenerMixin.js' {
  declare module.exports: $Exports<'reflux/src/ListenerMixin'>;
}
declare module 'reflux/src/listenTo.js' {
  declare module.exports: $Exports<'reflux/src/listenTo'>;
}
declare module 'reflux/src/listenToMany.js' {
  declare module.exports: $Exports<'reflux/src/listenToMany'>;
}
