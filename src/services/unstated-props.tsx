// orginally from https://github.com/mac-r/unstated-props
// modified to support NextJS, use seperate provide/subscribe HOCs
import * as React from 'react'
import { Provider, Subscribe } from 'unstated'

const subscribe = (WrappedComponent, containers) => {
  const _containerNames = Object.keys(containers)

  const _containerValues = Object.values(containers)

  return class extends React.Component {
    constructor(props: any) {
      super(props)
      this.renderChildren = this.renderChildren.bind(this)
    }

    static async getInitialProps(ctx) {
      let appProps = {}

      if (WrappedComponent.getInitialProps) {
        appProps = await WrappedComponent.getInitialProps(ctx)
      }

      return { ...appProps }
    }

    renderChildren() {
      const contrs: ConnectConfigObj = {}
      const functionArguments = arguments

      _containerNames.forEach((el, i) => {
        contrs[el] = functionArguments[i]
      })

      return <WrappedComponent {...this.props} containers={contrs} />
    }

    render() {
      return <Subscribe to={_containerValues}>{this.renderChildren}</Subscribe>
    }
  }
}

const provide = (WrappedComponent) => {
  return class extends React.Component {
    static async getInitialProps(ctx) {
      let appProps = {}

      if (WrappedComponent.getInitialProps) {
        appProps = await WrappedComponent.getInitialProps(ctx)
      }

      return { ...appProps }
    }

    render() {
      return (
        <Provider>
          <WrappedComponent {...this.props} />
        </Provider>
      )
    }
  }
}

export { subscribe, provide }