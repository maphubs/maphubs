//@flow
import React from 'react';

type Props = {
  goToSlide: Function,
  slideCount: number,
  slidesToScroll: number,
  currentSlide: number
}

export default class SlideDots extends React.PureComponent<Props, void> {

  
  getIndexes = (count: number, inc: number) => {
    const arr = [];
    for (let i = 0; i < count; i += inc) {
      arr.push(i);
    }
    return arr;
  }

  getListStyles = () => {
    return {
      position: 'relative',
      margin: 0,
      top: -10,
      padding: 0
    };
  }

  getListItemStyles = () => {
    return {
      listStyleType: 'none',
      display: 'inline-block'
    };
  }

  getButtonStyles = (active: boolean) => {
    return {
      border: 0,
      background: 'transparent',
      color: 'white',
      cursor: 'pointer',
      padding: 10,
      outline: 0,
      fontSize: 30,
      opacity: active ? 1 : 0.5
    };
  }

  render() {
    const self = this;
    const indexes = this.getIndexes(self.props.slideCount, self.props.slidesToScroll);
    return (
      <ul style={self.getListStyles()}>
        {
          indexes.map((index) => {
            const goToSlide = function(){
              self.props.goToSlide(index);
            };
            return (
              <li style={self.getListItemStyles()} key={index}>
                <button
                  style={self.getButtonStyles(self.props.currentSlide === index)}
                  onClick={goToSlide}>
                  &bull;
                </button>
              </li>
            );
          })
        }
      </ul>
    );
  }     
}