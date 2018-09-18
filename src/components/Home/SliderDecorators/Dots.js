// @flow
import React from 'react'

type Props = {
  goToSlide: Function,
  slideCount: number,
  slidesToScroll: number,
  currentSlide: number
}

export default class SlideDots extends React.PureComponent<Props, void> {
  getIndexes (count, inc) {
    const arr = []
    for (let i = 0; i < count; i += inc) {
      arr.push(i)
    }
    return arr
  }

  getListStyles () {
    return {
      position: 'relative',
      margin: 0,
      top: -10,
      padding: 0
    }
  }

  getListItemStyles () {
    return {
      listStyleType: 'none',
      display: 'inline-block'
    }
  }

  getButtonStyles (active) {
    return {
      border: 0,
      background: 'transparent',
      color: active ? '#ddd' : '#777',
      cursor: 'pointer',
      padding: 10,
      outline: 0,
      fontSize: 24,
      opacity: 0.85
    }
  }

  render () {
    const indexes = this.getIndexes(
      this.props.slideCount,
      this.props.slidesToScroll
    )
    return (
      <ul style={this.getListStyles()}>
        {indexes.map(index => {
          return (
            <li style={this.getListItemStyles()} key={index}>
              <button
                style={this.getButtonStyles(this.props.currentSlide === index)}
                onClick={this.props.goToSlide.bind(null, index)}
              >
                &bull;
              </button>
            </li>
          )
        })}
      </ul>
    )
  }
}
