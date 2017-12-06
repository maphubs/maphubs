import React from 'react';

export default class XComponentReact extends React.Component<any, void> {

  render() {
    /* eslint-disable react/jsx-no-bind */
    return (
      <div  
        ref={(container) => { this.xcontainer = container; }} 
        {...this.props.containerProps}
      />
    );
  }

  componentDidMount() {
    // eslint-disable-next-line global-require (needed for SSR)
    const xcomponent = require('xcomponent');
    const xEmbedComponent = xcomponent.create(this.props);
    xEmbedComponent.log(`instantiate_react_component`);

    let parent = xEmbedComponent.init(Object.assign({}, this.props), null, this.xcontainer);
    this.setState({parent});
    parent.render(this.xcontainer);
  }

  componentDidUpdate() {
    if (this.state && this.state.parent) {
      this.state.parent.updateProps(Object.assign({}, this.props));
    }
  }
}
