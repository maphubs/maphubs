// @flow
import React from 'react'
import _find from 'lodash.find'
import {Row, Col} from 'antd'
import LayerListDropDown from './LayerListDropDown'

type Props = {
  categories: Array<Object>,
  layers: Array<Object>,
  backgroundColor?: string,
  textColor?: string,
  toggleVisibility: Function,
  t: Function
}

export default class MapLayerMenu extends React.PureComponent<Props, void> {
  render () {
    const {categories, layers, toggleVisibility, backgroundColor, textColor, t} = this.props
    return (
      <Row type='flex' justify='left'
        style={{
          boxShadow: '0 0 1px rgba(0,0,0,0.7)',
          borderTop: '1px #444 solid',
          height: '35px',
          padding: '0px 15px',
          backgroundColor: backgroundColor || 'inherit',
          color: textColor || 'inherit'
        }}>
        {categories.map((category, i) => {
          const categoriesLayers = []
          category.layers.forEach(layer_id => {
            categoriesLayers.push(_find(layers, {layer_id}))
          })
          return (
            <Col key={`category-dropdown-${i}`} sm={6} md={4} lg={3}>
              <LayerListDropDown
                id={`category-dropdown-${i}`}
                name={category.name} layers={categoriesLayers}
                toggleVisibility={toggleVisibility} t={t}
              />
            </Col>
          )
        })
        }
      </Row>
    )
  }
}
