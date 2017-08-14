//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';

import ReactMapGL from 'react-map-gl';

export default class Map extends MapHubsComponent<DefaultProps, Props, State> {


  state = {
    viewport: {
      latitude: 37.729,
      longitude: -122.36,
      zoom: 11,
      bearing: 0,
      pitch: 50,
      width: 500,
      height: 500
    },
    settings: {
      dragPan: true,
      dragRotate: true,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
      minZoom: 0,
      maxZoom: 20,
      minPitch: 0,
      maxPitch: 85
      interactive: _this.state.interactive,
      dragRotate: _this.props.enableRotation ? true : false,
      touchZoomRotate: _this.props.enableRotation ? true : false,
      center: [0,0],
      hash: _this.props.hash,
      attributionControl: false
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  onViewportChange = viewport => this.setState({viewport});

  render() {
    const {viewport, settings} = this.state;

    return (
      <ReactMapGL
        {...viewport}
        {...settings}
        onViewportChange={this.onViewportChange}
      />
    );
  }

}