// @flow
import React from 'react'

type Props = {
  currentSlide: number,
  slidesToScroll: number,
  slideCount: number,
  wrapAround: boolean,
  nextSlide: Function
}

export default class SlideRightArrow extends React.PureComponent<Props, void> {
    props: Props

    handleClick = (e: Event) => {
      e.preventDefault()
      this.props.nextSlide()
    }

    getButtonStyles = (disabled: boolean) => {
      return {
        border: 0,
        background: 'rgba(0,0,0,0.4)',
        color: 'white',
        padding: 5,
        outline: 0,
        opacity: disabled ? 0.3 : 1,
        cursor: 'pointer'
      }
    }

    render () {
      return (
        <button
          className='valign-wrapper hide-on-small-only'
          style={this.getButtonStyles(this.props.currentSlide + this.props.slidesToScroll >= this.props.slideCount && !this.props.wrapAround)}
          onClick={this.handleClick}><i className='material-icons valign' style={{fontSize: '32px', fontWeight: 'bold'}}>arrow_forward</i></button>
      )
    }
}
