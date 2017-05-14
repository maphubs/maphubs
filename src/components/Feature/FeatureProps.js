//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';

export default class FeatureProps extends MapHubsComponent {

  props: {
    data: Object,
    presets: Object
  }

  static defaultProps = {
    data: null
  }

  render(){

    let tbody = '';
    if(this.props.presets){
       tbody = (
         <tbody>
          {
            this.props.presets.map((preset, i) => {
              let val = this.props.data[preset.tag];
              return (
                <tr key={`feature-attrib-${i}`}>
                  <td>{preset.label}</td>
                  <td>{val}</td>
                </tr>
              );
            })
          }
        </tbody>
      );
    }else{
      tbody = (
         <tbody>
          {
            Object.keys(this.props.data).map((key, i) => {
              let val = this.props.data[key];
              return (
                <tr key={`feature-attrib-${i}`}>
                  <td>{key}</td>
                  <td>{val}</td>
                </tr>
              );
            })
          }
        </tbody>
      );
    }

    return (
      <table>
        <thead>
          <tr>
              <th>{this.__('Tag')}</th>
              <th>{this.__('Value')}</th>
          </tr>
        </thead>
       {tbody}
      </table>

    );
  }

}