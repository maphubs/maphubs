import React from 'react'
export default class XComponentReact extends React.Component<any, any> {
  xcontainer: any
  render() {
    /* eslint-disable react/jsx-no-bind */
    return (
      <div
        ref={(container) => {
          this.xcontainer = container
        }}
        {...this.props.containerProps}
      />
    )
  }

  componentDidMount() {
    // eslint-disable-next-line global-require
    const xcomponent = require('xcomponent')

    const xEmbedComponent = xcomponent.create(this.props)
    xEmbedComponent.log('instantiate_react_component')
    const parent = xEmbedComponent.init(
      Object.assign({}, this.props),
      undefined,
      this.xcontainer
    )
    this.setState({
      parent
    })
    parent.render(this.xcontainer)
  }

  componentDidUpdate() {
    if (this.state && this.state.parent) {
      console.log('Updating Xcomponent')
      this.state.parent.updateProps(Object.assign({}, this.props))
    }
  }
}
