//@flow
import React from 'react';
import Slider from 'react-slick';
import Card  from './Card';


type Props = {
    cards: Array<Object>,
    responsive: Array<Object>,
    autoplay: boolean,
    arrows: boolean,
    dots: boolean,
    infinite: boolean,
    speed: number,
    slidesToShow: number,
    slidesToScroll: number,
   
  };

export default class CardCarousel extends React.Component<Props, Props, void> {

  props: Props

  static defaultProps: Props = {
    cards: [],
    responsive: [
      {breakpoint: 450, settings: {slidesToShow: 1,  slidesToScroll: 1}},
      {breakpoint: 768, settings: {slidesToShow: 2,  slidesToScroll: 2}},
      {breakpoint: 950, settings: {slidesToShow: 3,  slidesToScroll: 3}},
      {breakpoint: 1150, settings: {slidesToShow: 4,  slidesToScroll: 4}},
      {breakpoint: 1400, settings: {slidesToShow: 5,  slidesToScroll: 5}},
      {breakpoint: 1700, settings: {slidesToShow: 6,  slidesToScroll: 6}},
        {breakpoint: 2500, settings: {slidesToShow: 8,  slidesToScroll: 8}},
        {breakpoint: 4000, settings: {slidesToShow: 10,  slidesToScroll: 10}}
    ],
    autoplay: false,
    arrows: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3
  }

  render() {
    var settings = {
       autoplay: this.props.autoplay,
       arrows: this.props.arrows,
       dots: this.props.dots,
       infinite: this.props.infinite,
       speed: this.props.speed,
       slidesToShow: this.props.slidesToShow,
       slidesToScroll: this.props.slidesToScroll,
       responsive: this.props.responsive,
       lazyLoad: true
     };

     var slider = '';
     if(this.props.cards && this.props.cards.length > 0){
       slider = (
         <Slider ref="slider" {...settings}>
           {this.props.cards.map((card) => {
             return (
               <div key={card.id}>
                 <Card {...card} />
              </div>
            );
           })}
         </Slider>
       );
     }

     return (
       <div className="card-carousel">
        {slider}
      </div>
     );
  }
}