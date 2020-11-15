// @flow
import type {Node} from "React";import React from 'react'
import _find from 'lodash.find'
import LayerListDropDown from './LayerListDropDown'

type Props = {
  categories: Array<Object>,
  layers: Array<Object>,
  backgroundColor?: string,
  textColor?: string,
  toggleVisibility: Function,
  t: Function
}

export default class MapLayerMenu extends React.Component<Props, void> {
  static defaultProps: {|categories: Array<any>, layers: Array<any>|} = {
    categories: [],
    layers: []
  }

  popupContainer: any

  shouldComponentUpdate (): boolean {
    return false
  }

  render (): Node {
    const {categories, layers, toggleVisibility, backgroundColor, textColor, t} = this.props
    return (
      <>
        <div ref={(el) => { this.popupContainer = el }} />
        <div
          style={{
            boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
            borderTop: '1px #444 solid',
            height: '36px',
            padding: '0px 15px',
            backgroundColor: backgroundColor || 'white',
            color: textColor || 'inherit',
            overflowY: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {categories.map((category, i) => {
            const categoriesLayers = []
            category.layers.forEach(layer_id => {
              categoriesLayers.push(_find(layers, {layer_id}))
            })
            return (
              <span key={`category-dropdown-${i}`} style={{marginRight: '20px', display: 'inline-block'}}>
                <LayerListDropDown
                  id={`category-dropdown-${i}`}
                  name={category.name} layers={categoriesLayers}
                  toggleVisibility={toggleVisibility} t={t}
                />
              </span>
            )
          })}
        </div>

      </>
    )
  }
}
