// @flow
import React from 'react'
import LayerListStatic from './LayerListStatic'
import MapHubsPureComponent from '../MapHubsPureComponent'

type Props = {
  id: string,
  name: string,
  layers: Array<Object>,
  toggleVisibility: Function
}

export default class LayerListDropDown extends MapHubsPureComponent<Props, void> {
  componentDidMount () {
    M.Dropdown.init(this.refs.dropdownButton, {
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      coverTrigger: false, // Displays dropdown below the button
      alignment: 'right' // Displays dropdown with edge aligned to the left of button
    })
  }

  render () {
    return (
      <li style={{height: '35px'}}>
        <a ref='dropdownButton' className='category-dropdown-button dropdown-trigger'
          href='#!' data-target={this.props.id} style={{paddingRight: 0, height: '35px', lineHeight: '35px'}}>{this.props.name}
          <i className='material-icons right' style={{marginLeft: 0, lineHeight: '35px'}}>arrow_drop_down</i></a>
        <div ref='dropdownMenu' id={this.props.id} className='dropdown-content' style={{width: '300px'}}>
          <LayerListStatic layers={this.props.layers} toggleVisibility={this.props.toggleVisibility}
            showDesign={false} showRemove={false} showEdit={false} showChangeDesign={false} allowReorder={false}
          />
        </div>
      </li>
    )
  }
}
