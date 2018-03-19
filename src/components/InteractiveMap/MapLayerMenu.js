// @flow
import React from 'react'
import _find from 'lodash.find'
import LayerListDropDown from './LayerListDropDown'
import MapHubsPureComponent from '../MapHubsPureComponent'

type Props = {
  categories: Array<Object>,
  layers: Array<Object>,
  toggleVisibility: Function
}

export default class MapLayerMenu extends MapHubsPureComponent<Props, void> {
  findLayer = (layer_id: number) => {
    return _find(this.props.layers, {layer_id})
  }

  render () {
    const _this = this

    return (
      <nav style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)', borderTop: '1px #444 solid', height: '35px'}}>
        <div className='nav-wrapper z-depth-0'>
          <ul className='left' style={{height: '35px'}}>
            {this.props.categories.map((category, i) => {
              let name = category.name[_this.state.locale]
              if (!name) name = category.name.en
              const categoriesLayers = []
              category.layers.forEach(layer_id => {
                categoriesLayers.push(_this.findLayer(layer_id))
              })
              return (
                <LayerListDropDown key={`category-dropdown-${i}`} id={`category-dropdown-${i}`} name={name} layers={categoriesLayers} toggleVisibility={_this.props.toggleVisibility} />
              )
            })
            }
          </ul>
        </div>
      </nav>
    )
  }
}
